import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is not defined in environment variables for Video Processing Service.');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('Video Processing Service: MongoDB Connected...');
  } catch (err: any) {
    console.error('Video Processing Service: MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
