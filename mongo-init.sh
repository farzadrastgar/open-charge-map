set -e

mongosh <<EOF
use $MONGO_INITDB_DATABASE
db.createUser({
  user: '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [
    {
      role: "readWrite",
      db: '$MONGO_INITDB_DATABASE',
    },
  ],
});

db.createCollection("jobs");
db.createCollection("pois");

db.jobs.insertOne({
  _id: "e1c55ad4-3e4b-4d5a-9339-978f7921b0d5",
  type: "country",
  country: "US",
  bounding_box: [
    { lat: 49.384358, long: -125.0 },
    { lat: 24.396308, long: -66.93457 }
  ],
  parent_id: null,
  mesh_level: 0,
  POI_count: null
});
EOF