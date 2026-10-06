import { GoogleGenAI } from "@google/genai";
import { MongoClient } from "mongodb";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function embedText(text, taskType) {
  const response = await ai.models.embedContent({
    model: `gemini-embedding-001`,
    contents: text,
    config: { outputDimensionality: 768, taskType }
  });
  return response.embeddings[0].values;
}

const snippets = [
  "The cheetah is the fastest land animal, capable of reaching speeds up to 70 mph.",
  "Golden retrievers are known for their friendly and tolerant nature.",
  "Bananas are a great source of potassium and natural sugars.",
  "Mangoes are tropical stone fruits with a sweet, juicy flesh.",
  "Electric vehicles use rechargeable batteries instead of gasoline engines.",
  "Bicycles are a low-cost, eco-friendly way to commute short distances."
];

await mongoClient.connect();
const collection = mongoClient.db("researchmind_test").collection("snippets");

const documents = [];
for (const snippet of snippets) {
  const embedding = await embedText(snippet, "RETRIEVAL_DOCUMENT");
  documents.push({ text: snippet, embedding });
}

await collection.insertMany(documents);
console.log(`Inserted ${documents.length} documents.`);

await mongoClient.close();
