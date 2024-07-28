import { AnyBulkWriteOperation } from "mongodb";
import { getDb } from "./dbConnection";
import { getDbClient } from "../config/mongoConfig";
import { Job } from "../types/job";

interface Document {
  _id?: string;
  [key: string]: any;
}

export const getJobs = async () => {
  try {
    const db = await getDb();
    const collection = db.collection<Job>("jobs");

    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
};
