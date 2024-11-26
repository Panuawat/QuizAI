import React, { useState } from "react";
import { categories } from "../data/categories";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

function TopicSelector({ setQuizData }) {
  const [loadingTopic, setLoadingTopic] = useState(null); // Track the topic that’s loading
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("easy");

  const handleTopicSelect = async (topicName) => {
    setLoadingTopic(topicName); // Set loading for the selected topic
    try {
      const response = await fetch("http://localhost:8000/create-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicName,
          numberOfQuestions,
          level: selectedLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create quiz");
      }

      const data = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setLoadingTopic(null); // Reset loading state after the request
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Quiz Topics</h1>
        <p className="text-gray-600">Select a topic and customize your quiz</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <select
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "Question" : "Questions"}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-64">
          <select
            id="level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No topics found matching your search
          </div>
        ) : (
          filteredCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleTopicSelect(category.name)}
              disabled={loadingTopic === category.name} // Disable only the clicked topic button
              className="group relative overflow-hidden rounded-xl shadow-md transition-transform transform hover:scale-105 focus:outline-none"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={category.imageURL}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center">
                      <h2 className="text-white text-lg font-semibold text-left">
                        {category.name}
                      </h2>
                      <h2
                        className={`ml-2 px-2 py-1 rounded-md text-sm font-medium ${
                          selectedLevel === "easy"
                            ? "bg-green-500 text-white"
                            : selectedLevel === "medium"
                            ? "bg-orange-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {selectedLevel}
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm text-left mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
              {/* Loading Spinner */}
              {loadingTopic === category.name && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default TopicSelector;
