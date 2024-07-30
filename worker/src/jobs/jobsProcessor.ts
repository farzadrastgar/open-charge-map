import { kafkaConfiguration } from "../config/kafkaConfig";
import { updateJobs } from "../repositories/jobsRepository";
import { indexPOIs } from "../repositories/poisRepository";
import { sendMessage } from "../kafka/producer";
import { Job } from "../types/job";
import {
  createJobsWithSmallerMesh,
  fetchPointsOfInterest,
} from "../utils/functions";

export const processJob = async (job: Job): Promise<any> => {
  const poiResults = await fetchPointsOfInterest(job);

  if (poiResults.length == process.env.MAX_FETCH_BLOCK) {
    const newJobs = createJobsWithSmallerMesh(job);
    await updateJobs(newJobs, job);

    //produce jobs to fetch_topic

    await sendMessage(
      kafkaConfiguration.topic,
      newJobs.map((obj: Job) => JSON.stringify(obj))
    );
  } else if (poiResults.length !== 0) {
    const pois = poiResults.map((poi: any) => {
      return { ...poi, jobId: job._id, _id: poi.UUID };
    });

    await indexPOIs(pois, job._id);
  }
};
