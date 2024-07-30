import { getDb } from "../utils/dbConnection";
import { Poi } from "../types/poi";
import { AnyBulkWriteOperation } from "mongodb";

interface Document {
  _id?: string;
  [key: string]: any;
}
export const indexPOIs = async (pois: Poi[], jobId: string) => {
  const db = await getDb();
  const collection = db.collection("pois");

  try {
    await collection.deleteMany({ jobId });

    // Perform bulk upserts
    const bulkOperations: AnyBulkWriteOperation<Document>[] = pois.map(
      (poi) => ({
        updateOne: {
          filter: { _id: poi.UUID },
          update: { $set: poi },
          upsert: true,
        },
      })
    );
    await collection.bulkWrite(bulkOperations);
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
};
