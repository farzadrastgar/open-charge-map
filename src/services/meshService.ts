import { Job } from "../types/job";

export const computeNewMesh = (job: Job): any => {
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
        parent_id: job.parent_id,
        mesh_level: job.mesh_level++ || 0,
        POI_count: null,
      });
    }
  }

  return newJobs;
};

export const saveMeshToDatabase = async (mesh: any): Promise<void> => {
  // Implement the logic to save new mesh to database
};

export const publishMeshToKafka = async (mesh: any): Promise<void> => {
  // Implement the logic to publish new mesh to Kafka topic
};
