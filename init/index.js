const mongoose = require ("mongoose");
const initData = require("./data.js"); 
const Listing = require("../Models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
  console.log("Connected to DB");
})
.catch((err) => {
  console.log( err);
});

async function main() {
  await mongoose.connect( MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, owner:"674b3b5a7b406cec13aaf22f"}));
  await Listing.insertMany(initData.data);
  //console.log(listing.owner);
  console.log("data was initalized");
 
};
initDB();
