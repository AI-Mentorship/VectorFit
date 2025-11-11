
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

//console.log("Loaded env from:", path.resolve(__dirname, "../../.env"));
//console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "<set>" : "<missing>");


import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import * as readline from "readline";


// Configuration
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY!;
const PINECONE_API_KEY =process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX!;
const PINECONE_NAMESPACE = "your-namespace"; // Optional

// Initialize Gemini LLM
const llm = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const index = pinecone.index(PINECONE_INDEX_NAME);

// Create prompt template
const promptTemplate = `You are a personalized wardrobe stylist and fashion expert assistant. 
Your primary goal is to help the user create outfits and style recommendations using only the items listed in their personal inventory.

--- INVENTORY CONTEXT ---
The user's personal clothing inventory retrieved from their database is:
{context}
--- END INVENTORY CONTEXT ---

If the user asks for an outfit, you MUST only recommend combinations using items listed in the INVENTORY CONTEXT. 
If a desired item is NOT in the context, you should suggest it as a potential purchase or future addition, but clearly state it is not currently available.

If there are no documents in pinecone , refer them to take some pictures
Keep your answers less than 2 paragraphs please and be personable and friendly. Try to be chill like a homie with good fashion vibes.
Question: {question}

Answer:`;

const prompt = PromptTemplate.fromTemplate(promptTemplate);

// Chat function
async function chat(question: string): Promise<string> {
  try {
    console.log("Generating embedding for query...");
    
    // Use Pinecone's inference method directly
    const embedding = await pinecone.inference.embed(
      'llama-text-embed-v2',
      [question],
      { inputType: 'query' }
    );
    
    const queryVector = embedding[0].values;

    console.log("Querying Pinecone...");
    
    // Query Pinecone with the embedding
    const queryResponse = await index.query({
      vector: queryVector!,
      topK: 3,
      includeMetadata: true,
      //namespace: PINECONE_NAMESPACE || undefined,
    });

    console.log(`Found ${queryResponse.matches?.length || 0} relevant documents`);
    
    // Extract context from matches
    const context = queryResponse.matches
    // The map function now constructs a single string using both metadata fields
    ?.map((match) => { 
        const type = match.metadata?.type;
        const color = match.metadata?.dominant_color;

        // Combine them into a readable description (e.g., "Navy Blazer")
        if (type && color) {
            return `${color} ${type}`;
        }
        // Fallback if only one exists, or empty string if neither exists
        return type || color || ''; 
    })
    
    // Filter: Remove any empty or null strings from the mapping
    .filter((text) => text) 
    // Join: Separate each item with two newlines
    .join('\n\n') || 'No relevant context found.';

console.log("Generating response...");
    
    // Create chain
    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    // Run chain
    const response = await chain.invoke({
      context,
      question,
    });

    return response;
  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error('Rate limit hit. Please wait 60 seconds and try again.');
    }
    console.error("Chat error details:", error.message);
    throw error;
  }
}

// Main chat loop
async function main() {
  console.log("Fashion RAG Chatbot - Ask me anything about fashion!");
  console.log("Ready! Type 'quit' to exit\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "quit" || input.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      try {
        const answer = await chat(input);
        console.log(`\nBot: ${answer}\n`);
      } catch (error: any) {
        console.error("\n❌ Error:", error.message);
        console.log();
      }

      askQuestion();
    });
  };

  askQuestion();
}

main();