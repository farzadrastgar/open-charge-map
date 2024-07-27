import { Job } from "../types/job";
import { fetchPointsOfInterest } from "../utils/functions";

export const processJob = async (
  job: Job,
  topic: string,
  partition: number
): Promise<any> => {
  console.log(`Received message: ${job},${topic}`);
  const poiResults = await fetchPointsOfInterest(job);
  console.log(poiResults);
};
