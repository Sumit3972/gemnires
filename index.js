import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Initialize Google Generative AI with your API key from environment variables
const apiKey = "AIzaSyA7Iddus8rx052UZm8thQL5Tfbx_wI3d0k";
if (!apiKey) {
  throw new Error("API key is missing. Please set GEMINI_API_KEY in your environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define the model with updated version
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Configuration for AI response generation
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

// Helper function to generate AI response
async function generateCarExpertResponse(userQuery) {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userQuery,
            },
          ],
        },
      ],
      generationConfig,
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    throw new Error("Failed to generate response. Please check the query and try again.");
  }
}

// API endpoint for chatbot
app.post("/api/car-expert", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const aiResponse = await generateCarExpertResponse(query);
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
