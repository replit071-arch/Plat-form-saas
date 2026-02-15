import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { challengeAPI } from '../../../utils/api';
import { Plus, Trash2 } from 'lucide-react';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [challengeType, setChallengeType] = useState('1_step');
  const [sections, setSections] = useState([
    { section_name: 'Profit Targets', section_order: 1, rules: [{ rule_number: 1, rule_name: '', rule_value: '', description: '' }] }
  ]);
  const [segments, setSegments] = useState(['forex']);
  
  const { register, handleSubmit } = useForm();

  const addSection = () => {
    setSections([...sections, {
      section_name: '',
      section_order: sections.length + 1,
      rules: [{ rule_number: 1, rule_name: '', rule_value: '', description: '' }]
    }]);
  };

  const addRule = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].rules.push({
      rule_number: newSections[sectionIndex].rules.length + 1,
      rule_name: '',
      rule_value: '',
      description: ''
    });
    setSections(newSections);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await challengeAPI.create({
        ...data,
        challenge_type: challengeType,
        rules_sections: sections,
        segments,
        restrictions: {
          news_trading_allowed: data.news_trading_allowed || false,
          scalping_allowed: data.scalping_allowed || false,
          ea_allowed: data.ea_allowed || false,
        }
      });
      navigate('/admin/challenges');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Challenge</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Name</label>
            <input {...register('challenge_name', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Type</label>
              <select value={challengeType} onChange={(e) => setChallengeType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="1_step">1 Step</option>
                <option value="2_step">2 Step</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Size</label>
              <input type="number" {...register('account_size', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
              <input type="number" {...register('entry_fee', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leverage</label>
              <input {...register('leverage', { required: true })} placeholder="1:100" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Section-wise Rules</h2>
            <button type="button" onClick={addSection} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
          
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="border border-gray-200 rounded-lg p-4 mb-4">
              <input
                placeholder="Section Name (e.g., Profit Targets)"
                value={section.section_name}
                onChange={(e) => {
                  const newSections = [...sections];
                  newSections[sIdx].section_name = e.target.value;
                  setSections(newSections);
                }}
                className="w-full px-4 py-2 border rounded-lg mb-4 font-semibold"
              />
              
              {section.rules.map((rule, rIdx) => (
                <div key={rIdx} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    placeholder="Rule Name"
                    value={rule.rule_name}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[sIdx].rules[rIdx].rule_name = e.target.value;
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="Value (e.g., 10%)"
                    value={rule.rule_value}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[sIdx].rules[rIdx].rule_value = e.target.value;
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="Description"
                    value={rule.description}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[sIdx].rules[rIdx].description = e.target.value;
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded"
                  />
                </div>
              ))}
              
              <button type="button" onClick={() => addRule(sIdx)} className="text-blue-600 text-sm mt-2">
                + Add Rule to this Section
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>
          <button type="button" onClick={() => navigate('/admin/challenges')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChallenge;
