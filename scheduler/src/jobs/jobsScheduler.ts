import { kafkaConfiguration } from "../config/kafkaConfig";
import { getJobs } from "../db/jobsRepository";
import { sendMessage } from "../kafka/producer";
import { Job } from "../types/job";

export const scheduleJobs = async (): Promise<any> => {
  const jobs: Job[] = await getJobs();

  await sendMessage(
    kafkaConfiguration.topic,
    jobs.map((obj: Job) => JSON.stringify(obj))
  );
};
