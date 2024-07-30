import { Db, Collection, AnyBulkWriteOperation } from "mongodb";
import { getDb } from "../../../src/utils/dbConnection";
import { Job } from "../../../src/types/job";
import { updateJobs } from "../../../src/repositories/jobsRepository";

jest.mock("../../../src/utils/dbConnection", () => ({
  getDb: jest.fn(),
}));

describe("updateJobs", () => {
  let mockDb: Db;
  let mockCollection: Collection;

  beforeEach(() => {
    // Initialize mocks
    mockCollection = {
      bulkWrite: jest.fn(),
    } as unknown as Collection;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as Db;

    // Mock the getDb function to return the mockDb
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  it("should perform bulk upserts with correct operations", async () => {
    const newJobs: Job[] = [
      {
        _id: "1",
        type: "type1",
        country: "country1",
        bounding_box: [{ lat: 1, long: 1 }],
        parent_id: null,
        mesh_level: 1,
        is_active: true,
      },
    ];

    const parentJob: Job = {
      _id: "2",
      type: "type2",
      country: "country2",
      bounding_box: [{ lat: 2, long: 2 }],
      parent_id: null,
      mesh_level: 2,
      is_active: true,
    };

    await updateJobs(newJobs, parentJob);

    const expectedOperations: AnyBulkWriteOperation<Job>[] = [
      {
        updateOne: {
          filter: { _id: "1" },
          update: { $set: newJobs[0] },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { _id: "2" },
          update: { $set: { ...parentJob, is_active: false } },
          upsert: true,
        },
      },
    ];

    expect(mockCollection.bulkWrite).toHaveBeenCalledWith(expectedOperations);
  });

  it.only("should handle errors", async () => {
    const newJobs: Job[] = [
      {
        _id: "1",
        type: "type1",
        country: "country1",
        bounding_box: [{ lat: 1, long: 1 }],
        parent_id: null,
        mesh_level: 1,
        is_active: true,
      },
    ];

    const parentJob: Job = {
      _id: "2",
      type: "type2",
      country: "country2",
      bounding_box: [{ lat: 2, long: 2 }],
      parent_id: null,
      mesh_level: 2,
      is_active: true,
    };

    (mockCollection.bulkWrite as jest.Mock).mockRejectedValue(
      new Error("Bulk write failed")
    );

    await expect(updateJobs(newJobs, parentJob)).rejects.toThrow(
      "Bulk write failed"
    );
  });
});
