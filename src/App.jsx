import React, { useEffect, useRef, useState } from 'react';
import { useMqtt } from './store/MqttContext';
import { MdBatteryFull } from 'react-icons/md';
import { FiDownload } from 'react-icons/fi';
import { IoWifiSharp } from "react-icons/io5";
import axios from 'axios';
import Navbar from './pages/Navbar';

const apiUrl = import.meta.env.VITE_API_URL;

const App = () => {
  const [loading, setLoading] = React.useState(false);
  const [connected, setConnected] = useState("Disconnected")
  const lastMessageTimeRef = useRef(Date.now());

  const { data, clearTopicData, publishMessage } = useMqtt();
  const message1 = data["pump/compressor/status"] || [];
  const message2 = data["pump/stepper/status"] || [];

  const rawStatus = data["pump/system/status"] || []
  // console.log(rawStatus);

  const lastStatus = rawStatus.length > 0 ? rawStatus[rawStatus.length - 1] : null;
  const wifiStatus = lastStatus ? lastStatus.value : ""


  //  console.log(lastStatus);
  //  console.log(wifiStatus);

  useEffect(() => {
    if (rawStatus.length > 0) {
      // Update last received time on every new message
      lastMessageTimeRef.current = Date.now();
    }
  }, [rawStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMessageTimeRef.current > 3000) {
        setConnected("Disconnected");
        clearTopicData("pump/system/status");
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (wifiStatus.toLowerCase().includes("connected")) {
      setConnected("Connected");
    }
    // No else: Disconnection handled by timer above
  }, [wifiStatus]);



  const handleCompressor = () => {
    clearTopicData("pump/compressor/status")
    publishMessage("pump/compressor/control", "START");
  };

  const handleAeration = () => {
    clearTopicData("pump/stepper/status")
    publishMessage("pump/stepper/control", "START");
  };

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

  const getColor = (value) => {
    if (value === 'Started') return 'text-green-600 text-[13px]';
    if (value === 'Stopped') return 'text-red-600 text-[12.5px]';
    return 'text-gray-700';
  };

  const handleCSVDownload = async () => {
    try {
      setLoading(true); // Start loader
      const response = await axios.get(`${apiUrl}/download_aeration_csv/`, {
        responseType: 'blob',
      });

      const csvData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });

      console.log('📄 Raw CSV Data:', csvData);

      const excelFormattedCSV = csvData
        .split('\n')
        .map((row) => {
          if (!row.trim()) return row;
          const [date, time, value] = row.split(',');
          return `\t"${date}","${time}",${value}`;
        })
        .join('\n');

      const blob = new Blob(["\uFEFF" + excelFormattedCSV], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'aeration_values.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Excel-compatible CSV download started');
    } catch (error) {
      console.error('❌ Download failed:', error.response || error.message || error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (<>
  <Navbar/>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col gap-4 w-full md:w-3xl">

        {/* Top Row Controls */}
        <div className="flex flex-row justify-between items-center mb-4">
          {/* CSV Download Button */}
          <button
            onClick={handleCSVDownload}
            disabled={loading}
            className={`text-sm px-3 py-1 rounded flex items-center gap-1 text-white ${loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-400 hover:bg-blue-500'
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                .csv <FiDownload className="text-base" />
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-gray-300 px-2 py-1 rounded shadow">
            <IoWifiSharp
              className={`w-5 h-5 ${connected === "Connected" ? "text-green-600" : "text-red-600"
                }`}
            />
            <span className="text-sm font-semibold text-gray-700">
              {connected}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-300 px-2 py-1 rounded shadow">
            <MdBatteryFull className="text-green-600 w-5 h-5" />
            <span className="text-sm font-semibold text-gray-700">85%</span>
          </div>
        </div>

        {/* Compressor and Aeration Sections */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-10 w-full">
          {/* Compressor Section */}
          <div className="bg-white shadow-md rounded p-4 md:p-6 w-full text-center">
            <div className="flex flex-row justify-between align-middle mb-4 gap-4">
              <button
                onClick={handleCompressor}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded w-auto"
              >
                Compressor On
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-1 rounded"
                onClick={() => clearTopicData("pump/compressor/status")}
              >
                Reset
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-sm font-medium text-gray-700 mb-1">Compressor Messages</h2>
              <div className="bg-gray-50 p-2 h-60 w-full md:w-80 overflow-y-auto rounded border border-gray-200 text-xs">
                {message1.length > 0 ? (
                  message1.map((msg, index) => {
                    const { date, time } = formatDateTime(msg.time);
                    return (
                      <div key={index} className={getColor(msg.value)}>
                        Date: <span className=' font-bold'> {date} </span>   Time: <span className=' font-bold'> {time} </span>  State: <span className=' font-bold text-sm'> {msg.value} </span>
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
          <div className="bg-white shadow-md rounded p-4 md:p-6 w-full text-center">
            <div className="flex flex-row justify-between align-middle mb-4 gap-4">
              <button
                onClick={handleAeration}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded w-auto"
              >
                Aeration On
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-1 rounded"
                onClick={() => clearTopicData("pump/stepper/status")}
              >
                Reset
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-sm font-medium text-gray-700 mb-1">Aeration Messages:</h2>
              <div className="bg-gray-50 p-2 h-60 w-full md:w-80 overflow-y-auto rounded border border-gray-200 text-xs">
                {message2.length > 0 ? (
                  message2.map((msg, index) => {
                    const { date, time } = formatDateTime(msg.time);
                    return (
                      <div key={index} className={getColor(msg.value)}>
                        Date: <span className=' font-bold'> {date} </span>   Time: <span className=' font-bold'> {time} </span>  State: <span className=' font-bold text-sm'> {msg.value} </span>
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
    </div>
    </>
  );

};

export default App;