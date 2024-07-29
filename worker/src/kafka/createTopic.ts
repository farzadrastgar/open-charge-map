import kafka from "../config/kafkaConfig";

// Create an Admin client
const admin = kafka.admin();

export const createTopicIfNotExists = async (topicName: string) => {
  await admin.connect();

  try {
    // List all topics
    const existingTopics = await admin.listTopics();

    // Check if the topic already exists
    if (existingTopics.includes(topicName)) {
      console.log(`Topic "${topicName}" already exists.`);
    } else {
      // Create a new topic
      await admin.createTopics({
        topics: [
          {
            topic: topicName,
            numPartitions: 1, // Number of partitions for the topic
            replicationFactor: 1, // Replication factor
          },
        ],
      });
      console.log(`Topic "${topicName}" created successfully!`);
    }
  } catch (error) {
    console.error("Error managing topic:", error);
  } finally {
    await admin.disconnect();
  }
};
