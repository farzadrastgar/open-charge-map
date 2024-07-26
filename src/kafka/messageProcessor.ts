import { fetchPointsOfInterest } from "../services/poiService";
// import { saveResultsToMongo } from "../services/mongoService";

import {
  computeNewMesh,
  saveMeshToDatabase,
  publishMeshToKafka,
} from "../services/meshService";
import { Job } from "../types/job";

export const processKafkaMessage = async (
  job: Job,
  topic: string,
  partition: number
): Promise<void> => {
  try {
    console.log(`Received message: ${job},${topic}`);
    const poiResults = await fetchPointsOfInterest(job);
    console.log(poiResults);

    // await saveResultsToMongo(poiResults);

    // if (poiResults.length > 10000) {
    //   const mesh = await computeNewMesh(poiResults);
    //   await saveMeshToDatabase(mesh);
    //   await publishMeshToKafka(mesh);
    // }

    // await payload.consumer.commitOffsets([
    //   { topic, partition, offset: (Number(message.offset) + 1).toString() },
    // ]);
  } catch (error) {
    console.error("Error processing Kafka message:", error);
  }
};
