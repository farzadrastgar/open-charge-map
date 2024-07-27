import { MongoClient, ClientSession } from "mongodb";
import { getDb } from "./dbConnection";
import { getDbClient } from "../config/mongoConfig";
import { Job } from "../types/job";

export const updateJobs = async (jobs: Job[], parentJob: Job) => {
  //   const db = await getDb();
  //   const collection = db.collection("jobs");
  //   const client = getDbClient() as MongoClient;
  //   const session: ClientSession = client.startSession();
  //   try {
  //     session.startTransaction();
  //     // Perform bulk upserts
  //     const upsertOperations = jobs.map((job) => ({
  //       updateOne: {
  //         filter: { _id: job._id },
  //         update: { $set: job },
  //         upsert: true,
  //       },
  //     }));
  //     await collection.bulkWrite(upsertOperations, { session });
  //     await session.commitTransaction();
  //     console.log("Transaction committed successfully");
  //   } catch (error) {
  //     console.error("Error during transaction:", error);
  //     await session.abortTransaction();
  //     throw error;
  //   } finally {
  //     session.endSession();
  //   }
};
