import { Collection, AnyBulkWriteOperation, Db } from "mongodb";
import { getDb } from "../../../src/utils/dbConnection";
import { Poi } from "../../../src/types/poi";
import { indexPOIs } from "../../../src/repositories/poisRepository";
interface Document {
  _id?: string;
  [key: string]: any;
}
// Mock the getDb function
jest.mock("../../../src/utils/dbConnection", () => ({
  getDb: jest.fn(),
}));

describe("indexPOIs", () => {
  let mockDb: Db;
  let mockCollection: Collection;

  beforeEach(() => {
    // Initialize mocks
    mockCollection = {
      deleteMany: jest.fn(),
      bulkWrite: jest.fn(),
    } as unknown as Collection;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as Db;

    // Mock the getDb function to return the mockDb
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  it("should delete existing POIs for the given jobId and perform bulk upserts", async () => {
    const pois: Poi[] = [
      {
        UUID: "poi1",
        jobId: "job1",
        // Other POI properties...
      },
      {
        UUID: "poi2",
        jobId: "job1",
        // Other POI properties...
      },
    ];
    const jobId = "job1";

    await indexPOIs(pois, jobId);

    // Check deleteMany call
    expect(mockCollection.deleteMany).toHaveBeenCalledWith({ jobId });

    // Prepare expected operations for bulkWrite
    const expectedOperations: AnyBulkWriteOperation<Document>[] = [
      {
        updateOne: {
          filter: { _id: "poi1" },
          update: { $set: pois[0] },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { _id: "poi2" },
          update: { $set: pois[1] },
          upsert: true,
        },
      },
    ];

    // Check bulkWrite call
    expect(mockCollection.bulkWrite).toHaveBeenCalledWith(expectedOperations);
  });

  it("should handle errors gracefully", async () => {
    const pois: Poi[] = [
      {
        UUID: "poi1",
        jobId: "job1",
        // Other POI properties...
      },
    ];
    const jobId = "job1";

    // Simulate an error during deleteMany
    (mockCollection.deleteMany as jest.Mock).mockRejectedValue(
      new Error("Delete failed")
    );

    await expect(indexPOIs(pois, jobId)).rejects.toThrow("Delete failed");

    // Simulate an error during bulkWrite
    (mockCollection.deleteMany as jest.Mock).mockResolvedValue({}); // Clear the error
    (mockCollection.bulkWrite as jest.Mock).mockRejectedValue(
      new Error("Bulk write failed")
    );

    await expect(indexPOIs(pois, jobId)).rejects.toThrow("Bulk write failed");
  });
});
