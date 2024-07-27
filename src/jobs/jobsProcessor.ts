import { indexPOIs } from "../db/jobsRepository";
import { Job } from "../types/job";
import { fetchPointsOfInterest } from "../utils/functions";
import { v4 as uuidv4 } from "uuid";

export const processJob = async (
  job: Job,
  topic: string,
  partition: number
): Promise<any> => {
  console.log(`Received message: ${job._id},${topic}`);
  const poiResults = await fetchPointsOfInterest(job);

  poiResults.map((poi: any) => {
    return { ...poi, jobId: job._id, _id: uuidv4() };
  });

  console.log(poiResults);

  await indexPOIs(poiResults, job._id);
};
