import mongoose from 'mongoose';
import redis from '../config/redis.js';
import NotAuthorizedError from '../errors/NotAuthorized.error.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    allocation: [
      {
        stock: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stock',
        },
        percentage: {
          type: Number,
          required: true,
        },
      },
    ],
    accounts: [
      {
        accountId: {
          type: String,
          required: true,
        },
        accountType: {
          type: String,
          required: true,
        },
        availableToTrade: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.getTokens = async function () {
  const tokens = await redis.get(this.email);
  if (!tokens) throw new NotAuthorizedError();
  return JSON.parse(tokens);
};

userSchema.methods.setTokens = async function (accessToken, refreshToken) {
  await redis.set(this.email, JSON.stringify({ accessToken, refreshToken }), 'EX', process.env.EXP);
};

userSchema.methods.deleteTokens = async function () {
  await redis.del(this.email);
};

export default mongoose.model('User', userSchema);
