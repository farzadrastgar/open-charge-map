import { Db } from "mongodb";
import { connectToDatabase } from "../config/mongoConfig";

let db: Db;

export const getDb = async () => {
  if (!db) {
    db = await connectToDatabase();
  }
  return db;
};
