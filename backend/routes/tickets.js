import express from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Generate unique ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TKT-${timestamp}-${random}`;
};

// ============================================
// CREATE TICKET
// ============================================

// User creates ticket
router.post('/', authenticate, authorize('user'), async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const userId = req.user.id;
    const adminId = req.user.adminId;

    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticketResult = await query(
      `INSERT INTO support_tickets (
        admin_id, user_id, ticket_number, subject, category, 
        priority, status, created_by_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [adminId, userId, ticketNumber, subject, category, priority || 'medium', 'open', 'user']
    );

    const ticket = ticketResult.rows[0];

    // Add first message
    await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message)
       VALUES ($1, $2, $3, $4)`,
      [ticket.id, userId, 'user', message]
    );

    // Get admin details for notification
    const adminResult = await query(
      'SELECT email, full_name FROM admins WHERE id = $1',
      [adminId]
    );

    // Notify admin via email
    if (adminResult.rows.length > 0) {
      await emailService.sendTicketNotification(ticket, adminResult.rows[0]);
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (admin_id, user_id, actor_role, action, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, userId, 'user', 'create_ticket', `Created support ticket: ${ticketNumber}`]
    );

    res.json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Admin creates ticket to Root
router.post('/admin-to-root', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const adminId = req.user.adminId;

    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticketResult = await query(
      `INSERT INTO support_tickets (
        admin_id, ticket_number, subject, category, 
        priority, status, created_by_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [adminId, ticketNumber, subject, category, priority || 'medium', 'open', 'admin']
    );

    const ticket = ticketResult.rows[0];

    // Add first message
    await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message)
       VALUES ($1, $2, $3, $4)`,
      [ticket.id, adminId, 'admin', message]
    );

    res.json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// ============================================
// GET TICKETS
// ============================================

// Get tickets for user
router.get('/my-tickets', authenticate, authorize('user'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let whereClause = 'WHERE user_id = $1';
    const params = [userId];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT st.*, 
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = st.id) as message_count,
        (SELECT created_at FROM ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message_at
       FROM support_tickets st
       ${whereClause}
       ORDER BY st.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get tickets for admin
router.get('/admin-tickets', authenticate, authorize('admin'), async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const { status, created_by_role } = req.query;

    let whereClause = 'WHERE admin_id = $1';
    const params = [adminId];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    if (created_by_role) {
      whereClause += ` AND created_by_role = $${params.length + 1}`;
      params.push(created_by_role);
    }

    const result = await query(
      `SELECT st.*, 
        u.full_name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = st.id) as message_count,
        (SELECT created_at FROM ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message_at
       FROM support_tickets st
       LEFT JOIN users u ON st.user_id = u.id
       ${whereClause}
       ORDER BY st.priority DESC, st.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get tickets for root admin
router.get('/root-tickets', authenticate, authorize('root_admin'), async (req, res) => {
  try {
    const { status, admin_id } = req.query;

    let whereClause = 'WHERE created_by_role = \'admin\'';
    const params = [];

    if (status) {
      whereClause += ' AND status = $1';
      params.push(status);
    }

    if (admin_id) {
      whereClause += ` AND admin_id = $${params.length + 1}`;
      params.push(admin_id);
    }

    const result = await query(
      `SELECT st.*, 
        a.company_name, a.email as admin_email,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = st.id) as message_count,
        (SELECT created_at FROM ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message_at
       FROM support_tickets st
       JOIN admins a ON st.admin_id = a.id
       ${whereClause}
       ORDER BY st.priority DESC, st.created_at DESC`,
      params.length > 0 ? params : undefined
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// ============================================
// GET SINGLE TICKET WITH MESSAGES
// ============================================

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    // Build query based on role
    let ticketQuery;
    let params = [id];

    if (role === 'user') {
      ticketQuery = `
        SELECT st.*, u.full_name as user_name, u.email as user_email
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        WHERE st.id = $1 AND st.user_id = $2
      `;
      params.push(req.user.id);
    } else if (role === 'admin') {
      ticketQuery = `
        SELECT st.*, u.full_name as user_name, u.email as user_email
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        WHERE st.id = $1 AND st.admin_id = $2
      `;
      params.push(req.user.adminId);
    } else {
      ticketQuery = `
        SELECT st.*, u.full_name as user_name, u.email as user_email, a.company_name
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        LEFT JOIN admins a ON st.admin_id = a.id
        WHERE st.id = $1
      `;
    }

    const ticketResult = await query(ticketQuery, params);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Get messages
    const messagesResult = await query(
      `SELECT tm.*, 
        CASE 
          WHEN tm.sender_role = 'user' THEN u.full_name
          WHEN tm.sender_role = 'admin' THEN a.full_name
          ELSE 'Root Admin'
        END as sender_name
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.sender_id = u.id AND tm.sender_role = 'user'
       LEFT JOIN admins a ON tm.sender_id = a.id AND tm.sender_role = 'admin'
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [id]
    );

    res.json({
      ticket,
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// ============================================
// ADD MESSAGE TO TICKET
// ============================================

router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_internal_note } = req.body;
    const senderId = req.user.id || req.user.adminId;
    const senderRole = req.user.role;

    // Verify access to ticket
    let accessCheck;
    if (senderRole === 'user') {
      accessCheck = await query(
        'SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2',
        [id, senderId]
      );
    } else if (senderRole === 'admin') {
      accessCheck = await query(
        'SELECT id FROM support_tickets WHERE id = $1 AND admin_id = $2',
        [id, req.user.adminId]
      );
    } else {
      accessCheck = await query('SELECT id FROM support_tickets WHERE id = $1', [id]);
    }

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Add message
    const result = await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message, is_internal_note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, senderId, senderRole, message, is_internal_note || false]
    );

    // Update ticket status to in_progress if it was open
    await query(
      `UPDATE support_tickets 
       SET status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({
      message: 'Message added successfully',
      ticket_message: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// ============================================
// UPDATE TICKET STATUS
// ============================================

router.patch('/:id/status', authenticate, authorize('admin', 'root_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const resolvedAt = status === 'resolved' ? 'CURRENT_TIMESTAMP' : null;

    await query(
      `UPDATE support_tickets 
       SET status = $1, resolved_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, resolvedAt, id]
    );

    res.json({ message: 'Ticket status updated successfully' });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// ============================================
// ASSIGN TICKET
// ============================================

router.patch('/:id/assign', authenticate, authorize('admin', 'root_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    await query(
      `UPDATE support_tickets 
       SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [assigned_to, id]
    );

    res.json({ message: 'Ticket assigned successfully' });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// ============================================
// TICKET STATISTICS
// ============================================

router.get('/stats/overview', authenticate, authorize('admin', 'root_admin'), async (req, res) => {
  try {
    let adminId = req.user.role === 'admin' ? req.user.adminId : req.query.admin_id;

    const statsQuery = req.user.role === 'root_admin' && !adminId
      ? `
        SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
          SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tickets
        FROM support_tickets
      `
      : `
        SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
          SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tickets
        FROM support_tickets
        WHERE admin_id = $1
      `;

    const params = adminId ? [adminId] : [];
    const result = await query(statsQuery, params);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket stats' });
  }
});

export default router;
