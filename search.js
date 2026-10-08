import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

await mongoClient.connect();
const collection = mongoClient.db("researchmind_test").collection("snippets");

async function embedText(text, taskType) {
  const response = await ai.models.embedContent({
    model: `gemini-embedding-001`,
    contents: text,
    config: { outputDimensionality: 768, taskType }
  });
  return response.embeddings[0].values;
};

const test_query = await embedText("What's the quickest animal on land?", "RETRIEVAL_QUERY");

const result = await collection.aggregate([
    {
       $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: test_query,
          limit: 3,
          numCandidates: 100,
       }
    },
    {
        $project: {
            text: 1,
            score: { $meta: "vectorSearchScore"}
        }
    }
]).toArray();

console.log(result);

await mongoClient.close();
