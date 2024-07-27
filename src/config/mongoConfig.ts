import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB_NAME || "mydatabase";

const client = new MongoClient(mongoUri);

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

export const getDbClient = () => client;
