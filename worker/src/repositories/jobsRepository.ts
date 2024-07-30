import { AnyBulkWriteOperation } from "mongodb";
import { getDb } from "../utils/dbConnection";
import { Job } from "../types/job";

interface Document {
  _id?: string;
  [key: string]: any;
}

export const updateJobs = async (newJobs: Job[], parentJob: Job) => {
  const db = await getDb();
  const collection = db.collection("jobs");
  parentJob.is_active = false;

  const jobs = [...newJobs, parentJob];

  try {
    // Perform bulk upserts
    const upsertOperations: AnyBulkWriteOperation<Document>[] = jobs.map(
      (job) => ({
        updateOne: {
          filter: { _id: job._id },
          update: { $set: job },
          upsert: true,
        },
      })
    );

    await collection.bulkWrite(upsertOperations);
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
};
