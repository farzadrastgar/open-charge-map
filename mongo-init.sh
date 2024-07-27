set -e

mongosh <<EOF
use $MONGO_DB_NAME
db.createUser({
  user: '$MONGO_DB_ROOT_USERNAME',
  pwd: '$MONGO_DB_ROOT_PASSWORD',
  roles: [
    {
      role: "readWrite",
      db: '$MONGO_DB_NAME',
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
  is_active:true,
});
EOF