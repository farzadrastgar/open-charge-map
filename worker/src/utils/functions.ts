import axios from "axios";
import { Job } from "../types/job";
import { v4 as uuidv4 } from "uuid";

export const createJobsWithSmallerMesh = (job: Job): Job[] => {
  const [lat1, lon1] = [job.bounding_box[0].lat, job.bounding_box[0].long];
  const [lat2, lon2] = [job.bounding_box[1].lat, job.bounding_box[1].long];

  const isWider = Math.abs(lon2 - lon1) > Math.abs(lat2 - lat1);
  const [midLat, midLon] = [(lat1 + lat2) / 2, (lon1 + lon2) / 2];

  return [
    {
      _id: uuidv4(),
      type: job.type,
      country: job.country,
      bounding_box: isWider
        ? [
            { lat: lat1, long: lon1 },
            { lat: lat2, long: midLon },
          ]
        : [
            { lat: lat1, long: lon1 },
            { lat: midLat, long: lon2 },
          ],
      parent_id: job._id,
      mesh_level: (job.mesh_level || 0) + 1,
      is_active: true,
    },
    {
      _id: uuidv4(),
      type: job.type,
      country: job.country,
      bounding_box: isWider
        ? [
            { lat: lat1, long: midLon },
            { lat: lat2, long: lon2 },
          ]
        : [
            { lat: midLat, long: lon1 },
            { lat: lat2, long: lon2 },
          ],
      parent_id: job._id,
      mesh_level: (job.mesh_level || 0) + 1,
      is_active: true,
    },
  ];
};

export const fetchPointsOfInterest = async (jobData: Job) => {
  const { API_URL, API_KEY, MAX_FETCH_BLOCK } = process.env as {
    API_URL: string;
    API_KEY: string;
    MAX_FETCH_BLOCK: string;
  };

  const params = {
    output: "json",
    countrycode: jobData.country,
    boundingbox: `(${jobData.bounding_box[0].lat},${jobData.bounding_box[0].long}),(${jobData.bounding_box[1].lat},${jobData.bounding_box[1].long})`,
    maxresults: MAX_FETCH_BLOCK,
    compact: true,
    verbose: false,
    key: API_KEY,
  };

  try {
    const response = await axios.get(API_URL, { params });
    console.log("POI Count:", response.data.length);
    console.log("Bounding Box:", jobData.bounding_box);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const retryOperation = async (
  operation: () => Promise<void>,
  retries: number,
  delay: number
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log("Attempt:", attempt + 1);
      await operation();
      return; // Exit if the operation is successful
    } catch (err) {
      if (attempt < retries - 1) {
        await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
      } else {
        throw err; // Rethrow after final attempt
      }
    }
  }
};
