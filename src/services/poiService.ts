import axios from "axios";
import { Job } from "../types/job";

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
