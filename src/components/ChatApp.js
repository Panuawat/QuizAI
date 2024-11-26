import React, { useState } from "react";

function ChatApp() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      setLoading(true);
      setError(null);
      getRes(value);
    }
    console.log(chatHistory);
    
  };

  const handleSurpriseMe = () => {
    const surpriseMessages = [
      "Tell me an interesting fun fact that most people don't know about.",
      "Share a short inspirational quote and explain why it's meaningful.",
      "Tell me a brief silly joke to brighten my day.",
      "Share a random interesting scientific fact that will amaze me.",
      "Tell me about a strange but true historical event in one sentence.",
      "Give me a creative writing prompt that will spark imagination.",
      "Share a mind-bending paradox or philosophical question.",
      "Tell me about a random amazing animal fact.",
      "Share a surprising fact about space or the universe.",
      "Tell me about a unique cultural tradition from somewhere in the world."
    ];

    const randomMessage =
      surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];

    setValue(randomMessage);
  };

  const handleClear = () => {
    setValue("");
    setError(null);
    setChatHistory([]);
  };

  const getRes = async (message) => {
    if (!value) {
      setError("Please enter a message.");
      return;
    }

    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: value
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch("http://localhost:8000/gemini", options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();

      // Update chat history locally
      setChatHistory(prevHistory => [
        ...prevHistory,
        { role: "user", content: value },
        { role: "assistant", content: data }
      ]);

      setLoading(false);
      setValue("");
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the response.");
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <div className="h-96 overflow-y-auto mb-4 p-2 border-2 border-gray-300 rounded-lg">
          {chatHistory.map((chatItem, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                chatItem.role === "user" 
                  ? "bg-blue-100 text-right" 
                  : "bg-gray-100 text-left"
              }`}
            >
              <p className="break-words">
                {chatItem.role === "user" ? "You" : "AI"}: {chatItem.content}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center mb-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 border-2 border-gray-300 rounded-lg mr-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            Send
          </button>
        </form>
        <div className="flex gap-4">
          <button
            onClick={handleSurpriseMe}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300"
          >
            Surprise Me
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 disabled:bg-rose-300"
          >
            Clear
          </button>
        </div>

        {loading && (
          <p className="text-gray-500 mt-2">Loading...</p>
        )}

        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

export default ChatApp;