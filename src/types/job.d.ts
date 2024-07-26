type BoundingBox = {
  lat: number;
  long: number;
};

export type Job = {
  type: string;
  country: string;
  bounding_box: BoundingBox[];
  parent_id: string | null;
  mesh_level: number;
  POI_count: number | null;
};
