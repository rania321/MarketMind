import React, { useState, useEffect } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";

const ImageUploadPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [socialMediaMessage, setSocialMediaMessage] = useState(null);
  const [imageMessage, setImageMessage] = useState(null);
  const [queueName, setQueueName] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Social media message updated:", socialMediaMessage);
    console.log("Image message updated:", imageMessage);
  }, [socialMediaMessage, imageMessage]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
    }
  };

  // Handle image submission
  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      // Replace with your API endpoint
      const response = await axios.post("YOUR_API_ENDPOINT", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Image uploaded successfully:", response.data);
      setError(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image.");
    }
  };

  // Connect to RabbitMQ using STOMP
  useEffect(() => {
    const rabbitMQPort = "15674"; // Change to '5674' if confirmed as your Web STOMP port
    const client = new Client({
      brokerURL: `ws://localhost:${rabbitMQPort}/ws`,
      connectHeaders: {
        login: "guest", // Replace with your RabbitMQ username
        passcode: "guest", // Replace with your RabbitMQ password
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      const userQueue = "user_123_frontend"; // Static queue name
      setQueueName(userQueue);
      setIsConnected(true);
      console.log(`Connected to RabbitMQ, subscribing to /queue/${userQueue}`);

      // Subscribe to the queue with auto acknowledgment
      client.subscribe(
        `/queue/${userQueue}`,
        (message) => {
          try {
            const messageContent = JSON.parse(message.body);
            console.log("Received message:", messageContent);
            if (messageContent.social_media_post || messageContent.hashtags) {
              setSocialMediaMessage(messageContent);
              console.log("Stored social media message:", messageContent);
            } else if (messageContent.image || messageContent.image_data) {
              console.log(messageContent);
              setImageMessage(messageContent);
              console.log("Stored image message:", messageContent);
            } else {
              console.warn("Unrecognized message format:", messageContent);
              setError("Received unrecognized message format.");
            }
          } catch (err) {
            console.error(
              "Error parsing message:",
              err,
              "Raw message:",
              message.body
            );
            setError("Received malformed message.");
          }
        },
        { ack: "auto" }
      );
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setError("Failed to connect to message queue.");
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    client.activate();

    // Cleanup on unmount
    return () => {
      console.log("Deactivating STOMP client");
      client.deactivate();
    };
  }, []);

  // Render social media post message
  const renderSocialMediaPost = (msg) => {
    console.log("Rendering social media post:", msg);
    if (!msg || (!msg.social_media_post && !msg.hashtags)) {
      console.warn("Invalid social media post format:", msg);
      return (
        <p className="my-2 text-red-500">No social media post received yet</p>
      );
    }
    return (
      <div className="my-2 p-2 border rounded">
        <p className="font-semibold text-gray-800">
          {msg.social_media_post || "No post content"}
        </p>
        <p className="text-sm text-gray-500">{msg.hashtags || "No hashtags"}</p>
      </div>
    );
  };

  // Render image message
  const renderImage = (msg) => {
    console.log("Rendering image:", msg);
    if (!msg || (!msg.image && !msg.image_data)) {
      console.warn("Invalid image format:", msg);
      return <p className="my-2 text-red-500">No image received yet</p>;
    }
    // Use image or image_data key
    const base64DataRaw = msg.image || msg.image_data;
    // Strip any data URL prefix and log the raw data
    const base64Data = base64DataRaw.startsWith("data:image")
      ? base64DataRaw.split(",")[1]
      : base64DataRaw;
    console.log("Base64 data for image:", base64Data.substring(0, 50) + "..."); // Log first 50 chars
    // Try multiple MIME types
    const mimeType = base64DataRaw.includes("png") ? "image/png" : "image/jpeg";
    return (
      <div className="my-2">
        <img
          src={`${mimeType};base64,${base64Data}`}
          alt="Received"
          className="max-w-xs rounded border-2 border-blue-500"
          style={{ display: "block", maxHeight: "200px" }}
          onError={(e) => console.error("Image rendering error:", e)}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Upload and Messages</h1>

      {/* Image Upload Section */}
      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-2 p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          OK
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="my-2 text-red-500">{error}</p>}

      {/* Connection Status */}
      <p className="my-2">
        RabbitMQ Status: {isConnected ? "Connected" : "Disconnected"}
        {queueName && ` (Queue: ${queueName})`}
      </p>

      {/* Messages Display */}
      <div className="border p-4 rounded max-h-96 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
        <div>
          {/* Static rendering of social media post */}
          {renderSocialMediaPost(socialMediaMessage)}
          {/* Static rendering of image */}
          {renderImage(imageMessage)}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPage;
