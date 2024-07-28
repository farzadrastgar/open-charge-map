import axios from "axios";
import { Job } from "../types/job";
import { v4 as uuidv4 } from "uuid";

export const createJobsWithSmallerMesh = (job: Job): any => {
  const lat1 = job.bounding_box[0].lat;
  const lon1 = job.bounding_box[0].long;
  const lat2 = job.bounding_box[1].lat;
  const lon2 = job.bounding_box[1].long;

  // Calculate the midpoints
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;

  // Initialize the list of regions
  const newJobs: Job[] = [];

  // Use nested loops to create the four sub-regions
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      newJobs.push({
        _id: uuidv4(),
        type: job.type,
        country: job.country,
        bounding_box: [
          {
            lat: i === 0 ? Math.max(lat1, lat2) : midLat,
            long: j === 0 ? Math.min(lon1, lon2) : midLon,
          },
          {
            lat: i === 0 ? midLat : Math.min(lat1, lat2),
            long: j === 0 ? midLon : Math.max(lon1, lon2),
          },
        ],
        parent_id: job._id,
        mesh_level: job.mesh_level++ || 0,
        is_active: true,
      });
    }
  }

  return newJobs;
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
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
