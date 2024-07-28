import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

const client = new MongoClient(mongoUri as string);

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
