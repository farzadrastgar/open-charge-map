import { EachMessagePayload } from "kafkajs";
import { fetchPointsOfInterest } from "../services/poiService";
import { saveResultsToMongo } from "../services/mongoService";
import {
  computeNewMesh,
  saveMeshToDatabase,
  publishMeshToKafka,
} from "../services/meshService";

export const processKafkaMessage = async (
  payload: EachMessagePayload
): Promise<void> => {
  const { topic, partition, message } = payload;

  try {
    console.log(`Received message: ${message.value?.toString()}`);
    const poiResults = await fetchPointsOfInterest(message.value);

    await saveResultsToMongo(poiResults);

    if (poiResults.length > 10000) {
      const mesh = await computeNewMesh(poiResults);
      await saveMeshToDatabase(mesh);
      await publishMeshToKafka(mesh);
    }

    await payload.consumer.commitOffsets([
      { topic, partition, offset: (Number(message.offset) + 1).toString() },
    ]);
  } catch (error) {
    console.error("Error processing Kafka message:", error);
  }
};
