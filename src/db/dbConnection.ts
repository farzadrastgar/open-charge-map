import { MongoClient, Db } from "mongodb";

const mongoUri: string = process.env.MONGO_URI || "mongodb://localhost:27017";
const client: MongoClient = new MongoClient(mongoUri);
let database: Db;

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await client.connect();
    database = client.db();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};

export const getDatabase = (): Db => {
  if (!database) {
    throw new Error("Database not connected. Call connectToMongoDB first.");
  }
  return database;
};
