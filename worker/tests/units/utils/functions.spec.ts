import { createJobsWithSmallerMesh } from "../../../src/utils/functions";
import { v4 as uuidv4 } from "uuid";
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
