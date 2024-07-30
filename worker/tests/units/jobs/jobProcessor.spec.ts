import { kafkaConfiguration } from "../../../src/config/kafkaConfig";
import { processJob } from "../../../src/jobs/jobsProcessor";
import { sendMessage } from "../../../src/kafka/producer";
import { updateJobs } from "../../../src/repositories/jobsRepository";
import { indexPOIs } from "../../../src/repositories/poisRepository";
import { Job } from "../../../src/types/job";
import {
  createJobsWithSmallerMesh,
  fetchPointsOfInterest,
} from "../../../src/utils/functions";

jest.mock("../../../src/repositories/jobsRepository", () => ({
  updateJobs: jest.fn(),
}));

jest.mock("../../../src/repositories/poisRepository", () => ({
  indexPOIs: jest.fn(),
}));

jest.mock("../../../src/kafka/producer", () => ({
  sendMessage: jest.fn(),
}));

jest.mock("../../../src/utils/functions", () => ({
  createJobsWithSmallerMesh: jest.fn(),
  fetchPointsOfInterest: jest.fn(),
}));

describe("processJob", () => {
  const job: Job = {
    _id: "job1",
    type: "type1",
    country: "country1",
    bounding_box: [{ lat: 0, long: 0 }],
    parent_id: null,
    mesh_level: 1,
    is_active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAX_FETCH_BLOCK = "10"; // Set this to the required test value
  });

  it("should create new jobs and send them if poiResults length matches MAX_FETCH_BLOCK", async () => {
    const poiResults = new Array(
      parseInt(process.env.MAX_FETCH_BLOCK as string, 10)
    ).fill({ UUID: "poi1" });
    (fetchPointsOfInterest as jest.Mock).mockResolvedValue(poiResults);
    const newJobs = [{ _id: "newJob1" }];
    (createJobsWithSmallerMesh as jest.Mock).mockReturnValue(newJobs);

    await processJob(job);

    expect(fetchPointsOfInterest).toHaveBeenCalledWith(job);
    expect(createJobsWithSmallerMesh).toHaveBeenCalledWith(job);
    expect(updateJobs).toHaveBeenCalledWith(newJobs, job);
    expect(sendMessage).toHaveBeenCalledWith(
      kafkaConfiguration.topic,
      newJobs.map((obj) => JSON.stringify(obj))
    );
  });

  it("should index POIs if poiResults length does not match MAX_FETCH_BLOCK but is non-zero", async () => {
    const poiResults = [{ UUID: "poi1" }];
    (fetchPointsOfInterest as jest.Mock).mockResolvedValue(poiResults);

    await processJob(job);

    expect(fetchPointsOfInterest).toHaveBeenCalledWith(job);
    expect(indexPOIs).toHaveBeenCalledWith(
      [{ ...poiResults[0], jobId: job._id, _id: "poi1" }],
      job._id
    );
  });

  it("should do nothing if poiResults length is zero", async () => {
    (fetchPointsOfInterest as jest.Mock).mockResolvedValue([]);

    await processJob(job);

    expect(fetchPointsOfInterest).toHaveBeenCalledWith(job);
    expect(createJobsWithSmallerMesh).not.toHaveBeenCalled();
    expect(updateJobs).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(indexPOIs).not.toHaveBeenCalled();
  });
});
