// src/App.js
import React, { useState } from "react";
import TopicSelector from "./components/TopicSelector";
import QuizGame from "./components/QuizGame";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatApp from "./components/ChatApp";

function App() {
  const [quizData, setQuizData] = useState(null);
  const [showChatApp, setShowChatApp] = useState(false);

  const handleAskAIClick = () => {
    setShowChatApp(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showChatApp ? (
        <ChatApp />
      ) : !quizData ? (
        <TopicSelector setQuizData={setQuizData} />
      ) : (
        <QuizGame quizData={quizData} onBackToTopics={() => setQuizData(null)} />
      )}
      <ToastContainer />
      
      <div
        className="fixed bottom-6 right-6 z-0 bg-orange-400 w-20 text-center rounded-lg  h-10 flex items-center justify-center cursor-pointer hover:bg-orange-500 duration-300 transform hover:translate-y-2 translate-y-0 "
        onClick={handleAskAIClick}
      >
        <h1>Ask AI</h1>
      </div>
    </div>
  );
}

export default App;