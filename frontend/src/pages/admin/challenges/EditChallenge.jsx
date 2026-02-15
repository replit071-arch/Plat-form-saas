import React from 'react';

const EditChallenge = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">EditChallenge</h1>
      <p className="text-gray-600 mb-6">This page is ready for implementation.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900">
          <strong>Instructions:</strong> Connect this component to the API endpoints in <code>utils/api.js</code>
        </p>
        <p className="text-blue-800 mt-2 text-sm">
          All backend APIs are fully functional. Just bind the data to UI elements following the pattern in Dashboard.jsx
        </p>
      </div>
    </div>
  );
};

export default EditChallenge;
