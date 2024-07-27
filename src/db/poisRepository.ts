import { MongoClient, ClientSession } from "mongodb";
import { getDb } from "./dbConnection";
import { getDbClient } from "../config/mongoConfig";
import { Poi } from "../types/poi";

export const indexPOIs = async (pois: Poi[], jobId: string) => {
  const db = await getDb();
  const collection = db.collection("pois");
  const client = getDbClient() as MongoClient;

  try {
    // Perform deletions first
    await collection.deleteMany({ jobId });

    // Perform bulk upserts
    const upsertOperations = pois.map((poi) => ({
      updateOne: {
        filter: { UUID: poi.UUID },
        update: { $set: poi },
      },
    }));
    await collection.bulkWrite(upsertOperations);
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
};
