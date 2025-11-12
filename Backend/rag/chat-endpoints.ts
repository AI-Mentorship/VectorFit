import express from 'express';
import path from "path";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(express.json());

// Configuration
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX!;
const WEATHER_API_KEY = '2e76f5290bb24b5395b45736250711';

// Initialize services
const llm = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pinecone.index(PINECONE_INDEX_NAME);

// Weather service
async function getWeatherData(latitude: number, longitude: number) {
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: WEATHER_API_KEY,
        q: `${latitude},${longitude}`,
        aqi: 'no'
      }
    });

    return {
      location: response.data.location.name,
      temp_f: response.data.current.temp_f,
      temp_c: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      feels_like_f: response.data.current.feelslike_f,
      feels_like_c: response.data.current.feelslike_c,
      wind_mph: response.data.current.wind_mph,
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    return null;
  }
}

// RAG chat function
async function chat(question: string, weatherData?: any): Promise<string> {
  try {
    console.log("Generating embedding for query...");
    
    const embedding = await pinecone.inference.embed(
      'llama-text-embed-v2',
      [question],
      { inputType: 'query' }
    );
    
    // Handle different response structures
    const queryVector = embedding.data?.[0]?.values 
      || embedding[0]?.values 
      || embedding.values;

    if (!queryVector) {
      throw new Error("Failed to generate embedding");
    }

    console.log("Querying Pinecone...");
    
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    console.log(`Found ${queryResponse.matches?.length || 0} relevant documents`);
    
    const context = queryResponse.matches
      ?.map((match) => { 
        const type = match.metadata?.type;
        const color = match.metadata?.dominant_color;
        if (type && color) {
          return `${color} ${type}`;
        }
        return type || color || ''; 
      })
      .filter((text) => text) 
      .join('\n\n') || 'No relevant context found.';

    // Build weather context
    let weatherContext = '';
    if (weatherData) {
      weatherContext = `\n\n--- CURRENT WEATHER ---
Location: ${weatherData.location}
Temperature: ${weatherData.temp_f}°F (${weatherData.temp_c}°C)
Feels like: ${weatherData.feels_like_f}°F
Condition: ${weatherData.condition}
Humidity: ${weatherData.humidity}%
Wind: ${weatherData.wind_mph} mph
--- END WEATHER ---`;
    }

    const promptTemplate = `You are a personalized wardrobe stylist and fashion expert assistant. 
Your primary goal is to help the user create outfits and style recommendations using only the items listed in their personal inventory.

--- INVENTORY CONTEXT ---
The user's personal clothing inventory retrieved from their database is:
{context}
--- END INVENTORY CONTEXT ---
${weatherContext}

If the user asks for an outfit, you MUST only recommend combinations using items listed in the INVENTORY CONTEXT. 
If a desired item is NOT in the context, you should suggest it as a potential purchase or future addition, but clearly state it is not currently available.

${weatherData ? 'Consider the current weather conditions when making recommendations.' : ''}

If there are no documents in pinecone, refer them to take some pictures of their clothes.
Keep your answers less than 2 paragraphs please and be personable and friendly. Try to be chill like a homie with good fashion vibes.

Question: {question}

Answer:`;

    const prompt = PromptTemplate.fromTemplate(promptTemplate);

    console.log("Generating response...");
    
    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      context,
      question,
    });

    return response;
  } catch (error: any) {
    console.error("Chat error details:", error.message);
    throw error;
  }
}

// API endpoint
app.post('/chat', async (req, res) => {
  try {
    const { question, latitude, longitude } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get weather data if coordinates provided
    let weatherData = null;
    if (latitude && longitude) {
      weatherData = await getWeatherData(latitude, longitude);
    }

    // Get RAG response
    const answer = await chat(question, weatherData);

    res.json({ 
      answer,
      weather: weatherData 
    });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat API server running on port ${PORT}`);
});