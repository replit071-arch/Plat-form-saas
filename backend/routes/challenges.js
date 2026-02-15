import express from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// CHALLENGE TEMPLATES
// ============================================

// Get all templates
router.get('/templates', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM challenge_templates WHERE is_global = true ORDER BY name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// ============================================
// CHALLENGE CRUD
// ============================================

// Create Challenge
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const client = await query.pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      challenge_name,
      challenge_type,
      account_size,
      entry_fee,
      leverage,
      currency,
      is_refundable,
      rules_sections, // Array of {section_name, section_order, rules}
      restrictions,
      segments
    } = req.body;

    const adminId = req.user.adminId;

    // Check challenge limit
    const adminResult = await client.query(
      `SELECT a.challenges_used, p.challenge_limit
       FROM admins a
       JOIN plans p ON a.plan_id = p.id
       WHERE a.id = $1`,
      [adminId]
    );

    const admin = adminResult.rows[0];
    
    if (admin.challenge_limit !== -1 && admin.challenges_used >= admin.challenge_limit) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Challenge limit reached. Upgrade your plan.' });
    }

    // Create challenge
    const challengeResult = await client.query(
      `INSERT INTO challenges (
        admin_id, challenge_name, challenge_type, account_size, 
        entry_fee, leverage, currency, is_refundable, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        adminId, challenge_name, challenge_type, account_size,
        entry_fee, leverage, currency, is_refundable, 'draft'
      ]
    );

    const challenge = challengeResult.rows[0];

    // Insert rules sections
    if (rules_sections && rules_sections.length > 0) {
      for (const section of rules_sections) {
        await client.query(
          `INSERT INTO challenge_rules (challenge_id, section_name, section_order, rules)
           VALUES ($1, $2, $3, $4)`,
          [challenge.id, section.section_name, section.section_order, JSON.stringify(section.rules)]
        );
      }
    }

    // Insert restrictions
    if (restrictions) {
      await client.query(
        `INSERT INTO challenge_restrictions (
          challenge_id, news_trading_allowed, scalping_allowed, hedging_allowed,
          martingale_allowed, ea_allowed, copy_trading_allowed, grid_allowed,
          arbitrage_allowed, overnight_holding_allowed, weekend_holding_allowed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          challenge.id,
          restrictions.news_trading_allowed ?? true,
          restrictions.scalping_allowed ?? true,
          restrictions.hedging_allowed ?? true,
          restrictions.martingale_allowed ?? false,
          restrictions.ea_allowed ?? true,
          restrictions.copy_trading_allowed ?? true,
          restrictions.grid_allowed ?? false,
          restrictions.arbitrage_allowed ?? false,
          restrictions.overnight_holding_allowed ?? true,
          restrictions.weekend_holding_allowed ?? true
        ]
      );
    }

    // Insert segments
    if (segments && segments.length > 0) {
      for (const segment of segments) {
        await client.query(
          `INSERT INTO challenge_segments (challenge_id, segment_name)
           VALUES ($1, $2)`,
          [challenge.id, segment]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  } finally {
    client.release();
  }
});

// Get all challenges for admin
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const { status } = req.query;

    let whereClause = 'WHERE admin_id = $1';
    const params = [adminId];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE challenge_id = c.id AND payment_status = 'completed') as sales_count,
        (SELECT SUM(final_price) FROM orders WHERE challenge_id = c.id AND payment_status = 'completed') as total_revenue
       FROM challenges c
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get single challenge with all details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.role === 'admin' ? req.user.adminId : req.body.admin_id;

    // Get challenge
    const challengeResult = await query(
      'SELECT * FROM challenges WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = challengeResult.rows[0];

    // Get rules sections
    const rulesResult = await query(
      'SELECT * FROM challenge_rules WHERE challenge_id = $1 ORDER BY section_order',
      [id]
    );

    // Get restrictions
    const restrictionsResult = await query(
      'SELECT * FROM challenge_restrictions WHERE challenge_id = $1',
      [id]
    );

    // Get segments
    const segmentsResult = await query(
      'SELECT segment_name FROM challenge_segments WHERE challenge_id = $1',
      [id]
    );

    res.json({
      ...challenge,
      rules_sections: rulesResult.rows,
      restrictions: restrictionsResult.rows[0] || {},
      segments: segmentsResult.rows.map(s => s.segment_name)
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// Update challenge
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const client = await query.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const adminId = req.user.adminId;

    const {
      challenge_name,
      account_size,
      entry_fee,
      leverage,
      currency,
      is_refundable,
      rules_sections,
      restrictions,
      segments
    } = req.body;

    // Update challenge
    await client.query(
      `UPDATE challenges 
       SET challenge_name = $1, account_size = $2, entry_fee = $3, 
           leverage = $4, currency = $5, is_refundable = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND admin_id = $8`,
      [challenge_name, account_size, entry_fee, leverage, currency, is_refundable, id, adminId]
    );

    // Delete and recreate rules
    if (rules_sections) {
      await client.query('DELETE FROM challenge_rules WHERE challenge_id = $1', [id]);
      
      for (const section of rules_sections) {
        await client.query(
          `INSERT INTO challenge_rules (challenge_id, section_name, section_order, rules)
           VALUES ($1, $2, $3, $4)`,
          [id, section.section_name, section.section_order, JSON.stringify(section.rules)]
        );
      }
    }

    // Update restrictions
    if (restrictions) {
      await client.query(
        `UPDATE challenge_restrictions 
         SET news_trading_allowed = $1, scalping_allowed = $2, hedging_allowed = $3,
             martingale_allowed = $4, ea_allowed = $5, copy_trading_allowed = $6,
             grid_allowed = $7, arbitrage_allowed = $8, overnight_holding_allowed = $9,
             weekend_holding_allowed = $10
         WHERE challenge_id = $11`,
        [
          restrictions.news_trading_allowed,
          restrictions.scalping_allowed,
          restrictions.hedging_allowed,
          restrictions.martingale_allowed,
          restrictions.ea_allowed,
          restrictions.copy_trading_allowed,
          restrictions.grid_allowed,
          restrictions.arbitrage_allowed,
          restrictions.overnight_holding_allowed,
          restrictions.weekend_holding_allowed,
          id
        ]
      );
    }

    // Update segments
    if (segments) {
      await client.query('DELETE FROM challenge_segments WHERE challenge_id = $1', [id]);
      
      for (const segment of segments) {
        await client.query(
          `INSERT INTO challenge_segments (challenge_id, segment_name)
           VALUES ($1, $2)`,
          [id, segment]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Challenge updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating challenge:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  } finally {
    client.release();
  }
});

// Publish challenge
router.post('/:id/publish', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.adminId;

    // Update challenge count
    await query(
      `UPDATE challenges SET status = 'published', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND admin_id = $2`,
      [id, adminId]
    );

    await query(
      'UPDATE admins SET challenges_used = challenges_used + 1 WHERE id = $1',
      [adminId]
    );

    res.json({ message: 'Challenge published successfully' });
  } catch (error) {
    console.error('Error publishing challenge:', error);
    res.status(500).json({ error: 'Failed to publish challenge' });
  }
});

// Duplicate challenge
router.post('/:id/duplicate', authenticate, authorize('admin'), async (req, res) => {
  const client = await query.pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const adminId = req.user.adminId;

    // Get original challenge
    const originalResult = await client.query(
      'SELECT * FROM challenges WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    if (originalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const original = originalResult.rows[0];

    // Create duplicate
    const newChallenge = await client.query(
      `INSERT INTO challenges (
        admin_id, challenge_name, challenge_type, account_size, 
        entry_fee, leverage, currency, is_refundable, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        adminId, 
        `${original.challenge_name} (Copy)`, 
        original.challenge_type,
        original.account_size,
        original.entry_fee,
        original.leverage,
        original.currency,
        original.is_refundable,
        'draft'
      ]
    );

    const newId = newChallenge.rows[0].id;

    // Copy rules
    await client.query(
      `INSERT INTO challenge_rules (challenge_id, section_name, section_order, rules)
       SELECT $1, section_name, section_order, rules FROM challenge_rules WHERE challenge_id = $2`,
      [newId, id]
    );

    // Copy restrictions
    await client.query(
      `INSERT INTO challenge_restrictions 
       SELECT nextval('challenge_restrictions_id_seq'), $1, news_trading_allowed, scalping_allowed, 
              hedging_allowed, martingale_allowed, ea_allowed, copy_trading_allowed, 
              grid_allowed, arbitrage_allowed, overnight_holding_allowed, weekend_holding_allowed, 
              CURRENT_TIMESTAMP
       FROM challenge_restrictions WHERE challenge_id = $2`,
      [newId, id]
    );

    // Copy segments
    await client.query(
      `INSERT INTO challenge_segments (challenge_id, segment_name)
       SELECT $1, segment_name FROM challenge_segments WHERE challenge_id = $2`,
      [newId, id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Challenge duplicated successfully',
      challenge: newChallenge.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error duplicating challenge:', error);
    res.status(500).json({ error: 'Failed to duplicate challenge' });
  } finally {
    client.release();
  }
});

// Delete challenge
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.adminId;

    // Check if challenge has orders
    const ordersResult = await query(
      'SELECT COUNT(*) FROM orders WHERE challenge_id = $1',
      [id]
    );

    if (parseInt(ordersResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete challenge with existing orders. Archive it instead.' 
      });
    }

    await query(
      'DELETE FROM challenges WHERE id = $1 AND admin_id = $2',
      [id, adminId]
    );

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Archive challenge
router.post('/:id/archive', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.adminId;

    await query(
      `UPDATE challenges SET status = 'archived', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND admin_id = $2`,
      [id, adminId]
    );

    res.json({ message: 'Challenge archived successfully' });
  } catch (error) {
    console.error('Error archiving challenge:', error);
    res.status(500).json({ error: 'Failed to archive challenge' });
  }
});

// Get public challenges (for users)
router.get('/public/list', async (req, res) => {
  try {
    const { admin_id } = req.query;

    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE challenge_id = c.id AND payment_status = 'completed') as participants
       FROM challenges c
       WHERE c.admin_id = $1 AND c.status = 'published'
       ORDER BY c.created_at DESC`,
      [admin_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

export default router;
