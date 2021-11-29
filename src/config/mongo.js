import mongoose from 'mongoose';

export async function mongoConnect() {
  await mongoose.connect(`mongodb://localhost:27017`, {
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
  });
  console.log('Connected to MongoDB');
}
