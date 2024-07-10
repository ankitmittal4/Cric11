import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `MongoDB connected DB Host: ${ConnectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};
export default connectDB;
