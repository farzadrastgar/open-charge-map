import {
  createJobsWithSmallerMesh,
  fetchPointsOfInterest,
  retryOperation,
} from "../../../src/utils/functions";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Job } from "../../../src/types/job";

jest.setTimeout(10000);
const mock = new MockAdapter(axios);

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("createJobsWithSmallerMesh", () => {
  it("should split a wider bounding box horizontally", () => {
    const job = {
      _id: "job-id",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 50, long: 10 },
      ],
      mesh_level: 0,
      is_active: true,
      parent_id: null,
    };

    const result = createJobsWithSmallerMesh(job);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      _id: "mock-uuid",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 25, long: 10 },
      ],
      parent_id: "job-id",
      mesh_level: 1,
      is_active: true,
    });
    expect(result[1]).toEqual({
      _id: "mock-uuid",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 25, long: 0 },
        { lat: 50, long: 10 },
      ],
      parent_id: "job-id",
      mesh_level: 1,
      is_active: true,
    });
  });

  it("should split a wider bounding box vertically", () => {
    const job = {
      _id: "job-id",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 10, long: 50 },
      ],
      mesh_level: 0,
      is_active: true,
      parent_id: null,
    };

    const result = createJobsWithSmallerMesh(job);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      _id: "mock-uuid",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 0, long: 0 },
        { lat: 10, long: 25 },
      ],
      parent_id: "job-id",
      mesh_level: 1,
      is_active: true,
    });
    expect(result[1]).toEqual({
      _id: "mock-uuid",
      type: "example-type",
      country: "example-country",
      bounding_box: [
        { lat: 0, long: 25 },
        { lat: 10, long: 50 },
      ],
      parent_id: "job-id",
      mesh_level: 1,
      is_active: true,
    });
  });
});

describe("fetchPointsOfInterest", () => {
  afterEach(() => {
    mock.reset(); // Reset the mock after each test
  });

  it("should fetch points of interest successfully", async () => {
    // Define a mock response
    const mockResponse = [
      { id: 1, name: "POI 1" },
      { id: 2, name: "POI 2" },
    ];
    mock.onGet(process.env.API_URL).reply(200, mockResponse);

    // Define the jobData
    const jobData: Job = {
      _id: "123",
      type: "example",
      country: "US",
      bounding_box: [
        { lat: 40.73061, long: -73.935242 },
        { lat: 40.74161, long: -73.925242 },
      ],
      parent_id: null,
      mesh_level: 1,
      is_active: true,
    };

    // Call the function
    const data = await fetchPointsOfInterest(jobData);
    // Assertions
    expect(data).toEqual(mockResponse);
    expect(mock.history.get[0].url).toBe(process.env.API_URL);
    expect(mock.history.get[0].params).toEqual({
      output: "json",
      countrycode: jobData.country,
      boundingbox: `(40.73061,-73.935242),(40.74161,-73.925242)`,
      maxresults: process.env.MAX_FETCH_BLOCK,
      compact: true,
      verbose: false,
      key: process.env.API_KEY,
    });
  });

  it("should handle errors", async () => {
    // Set up mock to return an error
    mock.onGet(process.env.API_URL).reply(500);

    const jobData: Job = {
      _id: "123",
      type: "example",
      country: "US",
      bounding_box: [
        { lat: 40.73061, long: -73.935242 },
        { lat: 40.74161, long: -73.925242 },
      ],
      parent_id: null,
      mesh_level: 1,
      is_active: true,
    };

    // Check if the function throws an error
    await expect(fetchPointsOfInterest(jobData)).rejects.toThrow();
  });
});

describe("retryOperation", () => {
  it("should succeed on the first attempt", async () => {
    const operation = jest.fn().mockResolvedValueOnce(undefined);
    await retryOperation(operation, 3, 1000);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry the specified number of times and then succeed", async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error("Fail"))
      .mockRejectedValueOnce(new Error("Fail"))
      .mockResolvedValueOnce(undefined); // Simulate a successful operation on the third attempt

    await retryOperation(operation, 3, 100);
    expect(operation).toHaveBeenCalledTimes(3); // Check if the operation was called 3 times
  });

  it("should retry the specified number of times and then throw an error", async () => {
    const operation = jest.fn().mockRejectedValue(new Error("Fail")); // Simulate a failing operation

    await expect(retryOperation(operation, 3, 1000)).rejects.toThrow("Fail"); // Expect the final error to be thrown
    expect(operation).toHaveBeenCalledTimes(3); // Check if the operation was called 3 times
  });

  it("should wait the correct delay between retries", async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error("Fail"))
      .mockRejectedValueOnce(new Error("Fail"))
      .mockResolvedValueOnce(undefined);
    const delay = 1000;

    const start = Date.now();
    await retryOperation(operation, 3, delay);
    const end = Date.now();

    const elapsedTime = end - start;
    console.log(elapsedTime);
    expect(elapsedTime).toBeGreaterThanOrEqual(delay * 2); // Must be at least 2 delays
    expect(elapsedTime).toBeLessThanOrEqual(delay * 3); // Must be less than 3 delays
  });
});
