import { MongoClient, ClientSession } from "mongodb";
import { getDb } from "./dbConnection";
import { getDbClient } from "../config/mongoConfig";
import { Poi } from "../types/poi";

export const indexPOIs = async (pois: Poi[], jobId: string) => {
  const db = await getDb();
  const collection = db.collection("pois");
  const client = getDbClient() as MongoClient;
  const session: ClientSession = client.startSession();

  try {
    session.startTransaction();

    // Perform deletions first
    await collection.deleteMany({ [jobId]: { $in: jobId } }, { session });

    // Perform bulk upserts
    const upsertOperations = pois.map((poi) => ({
      updateOne: {
        filter: { UUID: poi.UUID },
        update: { $set: poi },
        upsert: true,
      },
    }));
    await collection.bulkWrite(upsertOperations, { session });

    await session.commitTransaction();
    console.log("Transaction committed successfully");
  } catch (error) {
    console.error("Error during transaction:", error);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
