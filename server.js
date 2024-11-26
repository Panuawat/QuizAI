// server.js
const PORT = 8000;
const express = require("express");
const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000", // Your React app's URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY);

app.post("/create-topic", async (req, res) => {
  try {
    const { topicName, numberOfQuestions = 1, level } = req.body; // Add level parameter
    console.log("Received level:", level); // Debugging to verify level

    const quizQuestions = await generateQuizQuestions(topicName, numberOfQuestions, level);

    res.json(quizQuestions);
    console.log(quizQuestions);
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ error: "Error creating topic" });
  }
});

async function generateQuizQuestions(topic, numberOfQuestions = 1, level) {
  try {
    const questionsToGenerate = Math.min(Math.max(1, numberOfQuestions), 10); // Limit between 1 and 10 questions
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const questions = [];
    for (let i = 0; i < questionsToGenerate; i++) {
      const chat = model.startChat();

      // Question prompt including level
      const questionPrompt = `Generate a multiple choice ${level} question about ${topic}. Respond with ONLY the question text, without any choices or answers.`;
      const questionResult = await chat.sendMessage(questionPrompt);
      const question = (await questionResult.response).text().trim();

      // Options prompt
      const optionsPrompt = `Generate 4 distinct answer choices for this ${level} question: "${question}"
Response format should be exactly like this example:
1. First option
2. Second option
3. Third option
4. Fourth option`;

      const optionsResult = await chat.sendMessage(optionsPrompt);
      const optionsText = (await optionsResult.response).text();
      const options = optionsText
        .split("\n")
        .map((opt) => opt.replace(/^\d+\.\s*/, "").trim())
        .filter((opt) => opt.length > 0)
        .slice(0, 4);

      if (options.length !== 4) {
        throw new Error("Did not receive exactly 4 options");
      }

      // Correct answer prompt
      const correctAnswerPrompt = `For the ${level} question "${question}", which option number (1, 2, 3, or 4) is correct? Reply with just the number.`;
      const correctAnswerResult = await chat.sendMessage(correctAnswerPrompt);
      const correctAnswerText = (await correctAnswerResult.response)
        .text()
        .trim();
      const correctAnswer = parseInt(correctAnswerText) - 1;

      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
        throw new Error("Invalid correct answer received");
      }

      questions.push({
        question,
        options,
        correctAnswer,
      });
    }

    return {
      topic,
      level, // Include the level in the response
      questions,
    };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Error generating quiz questions: " + error.message);
  }
}

app.post("/gemini", async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const chat = model.startChat();
    const result = await chat.sendMessage(req.body.message);
    const response = await result.response;
    const text = response.text();

    res.send(text);
  } catch (error) {
    console.error("Error with AI response:", error);
    res.status(500).send("Error with AI response");
  }
});

// Add a cooldown timer to the /generate-more-questions endpoint
let lastGenerationTime = null;
const COOLDOWN_DURATION = 10000; // 10 seconds

app.post('/generate-more-questions', async (req, res) => {
  try {
    const { topic, numberOfQuestions = 2, level } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Check if the cooldown period has elapsed
    if (lastGenerationTime !== null && Date.now() - lastGenerationTime < COOLDOWN_DURATION) {
      return res.status(429).json({ error: 'Please wait 10 seconds before generating more questions.' });
    }

    const questions = await Promise.all(
      Array(numberOfQuestions).fill().map(async () => {
        const chat = model.startChat();

        // Generate question
        const questionResponse = await chat.sendMessage(
          `Generate a multiple choice ${level} question about ${topic}. Respond with ONLY the question text.`
        );
        const question = (await questionResponse.response).text().trim();

        // Generate options
        const optionsResponse = await chat.sendMessage(
          `Generate 4 distinct answer choices for this ${level} question: "${question}"
          Format: 1. First option\n2. Second option\n3. Third option\n4. Fourth option`
        );
        const options = (await optionsResponse.response).text()
          .split('\n')
          .map(opt => opt.replace(/^\d+\.\s*/, '').trim())
          .filter(opt => opt.length > 0)
          .slice(0, 4);

        // Get correct answer
        const correctAnswerResponse = await chat.sendMessage(
          `For the ${level} question "${question}", which option number (1-4) is correct? Reply with just the number.`
        );
        const correctAnswer = parseInt((await correctAnswerResponse.response).text().trim()) - 1;

        return { question, options, correctAnswer };
      })
    );
    console.log(questions);

    // Update the last generation time
    lastGenerationTime = Date.now();

    res.json({ topic, level, questions });
  } catch (error) {
    console.error('Error generating more questions:', error);
    res.status(500).json({ error: 'Error generating more questions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
