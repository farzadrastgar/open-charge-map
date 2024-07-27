import { kafkaConfiguration } from "../config/kafkaConfig";
import { updateJobs } from "../db/jobsRepository";
import { indexPOIs } from "../db/poisRepository";
import { sendMessage } from "../kafka/producer";
import { Job } from "../types/job";
import {
  createJobsWithSmallerMesh,
  fetchPointsOfInterest,
} from "../utils/functions";
import { v4 as uuidv4 } from "uuid";

export const processJob = async (
  job: Job,
  topic: string,
  partition: number
): Promise<any> => {
  console.log(`Received message: ${job._id},${topic}`);
  const poiResults = await fetchPointsOfInterest(job);

  if (poiResults.length == process.env.MAX_FETCH_BLOCK) {
    const newJobs = createJobsWithSmallerMesh(job);
    await updateJobs(newJobs, job);

    //produce jobs to fetch_topic

    await sendMessage(
      kafkaConfiguration.topic,
      newJobs.map((obj: Job) => JSON.stringify(obj))
    );
  } else {
    const pois = poiResults.map((poi: any) => {
      return { ...poi, jobId: job._id, _id: uuidv4() };
    });

    await indexPOIs(pois, job._id);
  }
};
