import { Consumer, KafkaMessage } from "kafkajs";
import kafka, { kafkaConfiguration } from "../config/kafkaConfig";
import { processJob } from "../jobs/jobsProcessor";
import { retryOperation } from "../utils/functions";
import { sendMessage } from "./producer";

const consumer: Consumer = kafka.consumer({
  groupId: kafkaConfiguration.consumerGroupId,
  sessionTimeout: 60000, // Adjust session timeout
  heartbeatInterval: 3000, // Adjust heartbeat interval
});

export const startConsumer = async (): Promise<void> => {
  await consumer.connect();
  console.log("Consumer is connected");

  await consumer.subscribe({
    topic: kafkaConfiguration.topic,
    fromBeginning: false,
  });

  consumer.on(consumer.events.CRASH, async (event) => {
    console.error("Consumer crashed:", event.payload);
    process.exit(1);
  });

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }: {
      topic: string;
      partition: number;
      message: KafkaMessage;
    }) => {
      const job = JSON.parse(message.value?.toString() || "{}");

      try {
        console.log();
        console.log(`Received message: ${job._id}`);
        await retryOperation(
          async () => {
            await processJob(job);
          },
          parseInt(process.env.MAX_RETRY as string, 10) || 3,
          parseInt(process.env.RETRY_DELAY as string, 10) || 3
        );
      } catch (err) {
        console.log("Sending Message to DLQ", err);
        await sendMessage("DLQ", [JSON.stringify({ job, err })]);
      } finally {
        console.log("Commiting offsets:", message.offset);
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset, 10) + 1).toString(),
          },
        ]);
      }
    },
    autoCommit: false,
  });
};
