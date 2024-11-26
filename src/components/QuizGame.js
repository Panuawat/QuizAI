import React, { useState } from "react";
import { RotateCcw, ArrowLeft, Plus } from "lucide-react";
import CustomQuestions from "./CustomQuestionForm";
import { toast } from "react-toastify";

function QuizGame({ quizData, onBackToTopics }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [questions, setQuestions] = useState(quizData.questions);
  const [loading, setLoading] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(null);

  const handleAnswer = (option, index) => {
    setSelectedOption(option);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion === questions.length - 1) {
      setShowResult(true);
    } else {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption("");
      }, 1500);
    }
  };

  const handleAddQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
    setShowCustomForm(false);
  };

  const handleGenerateMoreQuestions = async () => {
    if (cooldownTimer) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/generate-more-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: quizData.topic,
            numberOfQuestions: 2,
            level: quizData.level,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Please wait 10 seconds before generating more questions.`);
        throw new Error(errorData.error);
      }

      const moreQuestions = await response.json();
      setQuestions([...questions, ...moreQuestions.questions]);
      setLoading(false);

      setCooldownTimer(setTimeout(() => {
        setCooldownTimer(null);
      }, 1000));
    } catch (error) {
      console.error("Error generating more questions:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
      {showResult ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-xl mb-6">
            Your score: {score} / {questions.length}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onBackToTopics}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Another Quiz
            </button>
            <button
              onClick={() => {
                setShowResult(false);
                setCurrentQuestion(0);
                setScore(0);
                setSelectedOption("");
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
                <button
                  onClick={handleGenerateMoreQuestions}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  {loading ? <RotateCcw className="h-4 w-4 animate-spin" /> : "Generate More Questions"}
                </button>
              </div>
            </div>

            <p className="text-lg mb-6">
              {questions[currentQuestion].question}
              {questions[currentQuestion].isCustom && (
                <span className="ml-2 text-sm text-blue-500">(Custom)</span>
              )}
            </p>

            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option, index)}
                  disabled={!!selectedOption}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedOption === option
                      ? index === questions[currentQuestion].correctAnswer
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t p-4">
            <button
              onClick={onBackToTopics}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </button>
          </div>
        </>
      )}

      {showCustomForm && (
        <CustomQuestions
          onAddQuestion={handleAddQuestion}
          onClose={() => setShowCustomForm(false)}
        />
      )}
    </div>
  );
}

export default QuizGame;