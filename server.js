import app from "./express.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Connect to database
try {
  mongoose.connect(process.env.KICITI_DATABASE_URI);
  console.log("Connected to database successfully!!!")
}
catch (error) {
  console.error(error);
}


// start server
app.listen(process.env.KICITI_PORT, (error) => {
  if (!error) return console.log("Starting server on port 3000...");
  console.log(error);
});
