import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    unique: true,
    required: true,
  },
  securityId: {
    type: String,
    unique: true,
    required: true,
  },
});

export default mongoose.model('Stock', stockSchema);
