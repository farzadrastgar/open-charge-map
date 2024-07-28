type BoundingBox = {
  lat: number;
  long: number;
};

export type Job = {
  _id: string;
  type: string;
  country: string;
  bounding_box: BoundingBox[];
  parent_id: string | null;
  mesh_level: number;
  is_active: boolean;
};
