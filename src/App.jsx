import React from 'react';
import { useMqtt } from './store/MqttContext';

const App = () => {
  const { data, clearTopicData, publishMessage } = useMqtt();
  const message1 = data["123/data"] || [];
  const message2 = data["456/data"] || [];

  const handleCompressor = () => {
    publishMessage("compressor", "ON");
  };

  const handleAeration = () => {
    publishMessage("aeration", "ON");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex space-x-10">
        {/* Compressor Section */}
        <div className="bg-white shadow-md rounded p-6 w-80 text-center">
          <button
            onClick={handleCompressor}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Compressor On
          </button>
          <div className="mt-4 text-left">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Compressor Messages (Topic: 123/data):</h2>
            <div className="bg-gray-50 p-2 h-40 overflow-y-auto rounded border border-gray-200 text-xs">
              {message1.length > 0 ? (
                message1.map((msg, index) => <div key={index}>{JSON.stringify(msg)}</div>)
              ) : (
                <div className="text-gray-400">No messages yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Aeration Section */}
        <div className="bg-white shadow-md rounded p-6 w-80 text-center">
          <button
            onClick={handleAeration}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          >
            Aeration On
          </button>
          <div className="mt-4 text-left">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Aeration Messages (Topic: 456/data):</h2>
            <div className="bg-gray-50 p-2 h-40 overflow-y-auto rounded border border-gray-200 text-xs">
              {message2.length > 0 ? (
                message2.map((msg, index) => <div key={index}>{JSON.stringify(msg)}</div>)
              ) : (
                <div className="text-gray-400">No messages yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
