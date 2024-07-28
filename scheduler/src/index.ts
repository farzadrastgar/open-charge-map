import { scheduleJobs } from "./jobs/jobsScheduler";
import { startProducer } from "./kafka/producer";

const startApplication = async () => {
  try {
    await startProducer();
    await scheduleJobs();
    process.exit(0);
  } catch (error) {
    console.error("Failed to start the application:", error);
  }
};

startApplication();
