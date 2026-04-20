import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone || '',
    role: payload.role || 'patient'
  });

  if (user.role === 'patient') {
    await Patient.create({
      user: user._id,
      fullName: user.fullName,
      phone: user.phone
    });
  }

  const token = signToken({ userId: user._id, role: user.role });
  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    token
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    },
    token
  };
};
