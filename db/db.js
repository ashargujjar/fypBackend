import mongoose, { connect } from "mongoose";
export const connectdb = async (cb) => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URL);
    if (!res) {
      throw new Error("error connecting the mongodb");
    }
    cb();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
