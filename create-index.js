import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI);

await mongoClient.connect();
const collection = mongoClient.db("researchmind_test").collection("snippets");

await collection.createSearchIndex({
  name: "vector_index",
  type: "vectorSearch",
  definition: {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: 768,
        similarity: "cosine",
      },
    ],
  },
});

await mongoClient.close();
