import { getDb } from "./dbConnection";
import { Poi } from "../types/poi";
import { BulkWriteOptions } from "mongodb";

export const indexPOIs = async (pois: Poi[], jobId: string) => {
  const db = await getDb();
  const collection = db.collection("pois");

  try {
    // Perform bulk upserts
    const bulkOperations = [
      { deleteMany: { filter: { jobId } } },
      ...pois.map((poi) => ({
        insertOne: { document: poi },
      })),
    ];
    await collection.bulkWrite(bulkOperations);
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
};
