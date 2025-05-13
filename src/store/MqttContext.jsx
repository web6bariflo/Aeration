// src/MqttContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // Track connection state
  const [data, setData] = useState(() => {
    return JSON.parse(localStorage.getItem("mqttData")) || {
      "pump/compressor/status": [],
      "pump/stepper/status": [],
    };
  });
  
  useEffect(() => {
    const mqttClient = mqtt.connect({
      hostname: "mqttbroker.bc-pl.com",
      port: 443,
      protocol: "wss",
      path: "/mqtt",
      username: "mqttuser",
      password: "Bfl@2025",
      clientId: `mqtt_${Math.random().toString(16).slice(3)}`, // Unique client ID
      reconnectPeriod: 5000 // Auto-reconnect every 5s if disconnected
    });

    // Connection status handler (only logs on change)
    const handleStatusChange = (newStatus) => {
      if (connectionStatus !== newStatus) {
        setConnectionStatus(newStatus);
        console.log(`MQTT: ${newStatus}`);
      }
    };

    mqttClient.on("connect", () => {
      handleStatusChange("connected");
      mqttClient.subscribe(["pump/compressor/status", "pump/stepper/status"]);
    });

    mqttClient.on("reconnect", () => {
      handleStatusChange("reconnecting");
    });

    mqttClient.on("offline", () => {
      handleStatusChange("disconnected");
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT error:", err);
      handleStatusChange("error");
    });

    mqttClient.on("message", (topic, message) => {
      const newMessage = {
        time: new Date().toISOString(),
        value: message.toString(),
      };

      console.log(`${topic} : ${message}`);
      
    
      setData((prevData) => {
        const updatedData = {
          ...prevData,
          [topic]: [...(prevData[topic] || []), newMessage].slice(-80),
        };
        localStorage.setItem("mqttData", JSON.stringify(updatedData));
        return updatedData;
      });
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
      handleStatusChange("disconnected");
    };
  }, []);

  const publishMessage = (topic, message) => {
    if (client && client.connected) {
      client.publish(topic, message);
      console.log(`🚀 Published to ${topic}:`, message);
    } else {
      console.warn("❌ MQTT client not connected");
    }
  };

  // MqttContext.jsx (append inside MqttProvider)
const clearTopicData = (topic) => {
  setData((prevData) => {
    const updatedData = {
      ...prevData,
      [topic]: [],
    };
    localStorage.setItem("mqttData", JSON.stringify(updatedData));
    return updatedData;
  });
};

  return (
    <MqttContext.Provider value={{ data, publishMessage, clearTopicData, connectionStatus }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);