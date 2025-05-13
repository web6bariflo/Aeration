import React from 'react';
import { useMqtt } from './store/MqttContext';
import { MdBatteryFull } from 'react-icons/md';

const App = () => {
  const { data, clearTopicData, publishMessage } = useMqtt();
  const message1 = data["pump/compressor/status"] || [];
  const message2 = data["pump/stepper/status"] || [];

  const handleCompressor = () => {
    clearTopicData("pump/compressor/status")
    publishMessage("pump/compressor/control", "START");
  };

  const handleAeration = () => {
    clearTopicData("pump/stepper/status")
    publishMessage("pump/stepper/control", "START");
  };

  // Function to split date and time
  const formatDateTime = (timeStr) => {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`
    };
  };

  // Function to get color class
  const getColor = (value) => {
    if (value === 'Started') return 'text-green-600';
    if (value === 'Stopped') return 'text-red-600';
    return 'text-gray-700';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex gap-10">

        {/* Battery Icon - Top Right Outside Compressor Section */}
        <div className="absolute top-30 right-48 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded shadow">
          <MdBatteryFull className="text-green-600 w-5 h-5" />
          <span className="text-sm font-semibold text-gray-700">85%</span>
        </div>

        {/* Compressor Section */}
        <div className="bg-white shadow-md rounded p-6 w-full text-center">
          <button
            onClick={handleCompressor}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Compressor On
          </button>
          <div className="mt-4 text-left">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Compressor Messages</h2>
            <div className="bg-gray-50 p-2 h-60 w-80 overflow-y-auto rounded border border-gray-200 text-xs">

              {message1.length > 0 ? (
                message1.map((msg, index) => {
                  const { date, time } = formatDateTime(msg.time);
                  return (
                    <div key={index} className={getColor(msg.value)}>
                      Date: {date} Time: {time} State: {msg.value}
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No messages yet.</div>
              )}

            </div>
          </div>
        </div>

        {/* Aeration Section */}
        <div className="bg-white shadow-md rounded p-6 w-full h-96 text-center">
          <button
            onClick={handleAeration}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          >
            Aeration On
          </button>
          <div className="mt-4 text-left">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Aeration Messages:</h2>
            <div className="bg-gray-50 p-2 h-60 w-80 overflow-y-auto rounded border border-gray-200 text-xs">
              {message2.length > 0 ? (
                message2.map((msg, index) => {
                  const { date, time } = formatDateTime(msg.time);
                  return (
                    <div key={index} className={getColor(msg.value)}>
                      Date: {date} Time: {time} State: {msg.value}
                    </div>
                  );
                })
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