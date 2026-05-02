import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  let profile = null;

  if (req.user.role === 'patient') {
    profile = await Patient.findOne({ user: req.user._id });
  } else if (req.user.role === 'doctor') {
    profile = await Doctor.findOne({ user: req.user._id });
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      profile
    }
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    data: users
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, message: 'User updated', data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Also delete associated patient/doctor profile if exists
  if (user.role === 'patient') {
    await Patient.findOneAndDelete({ user: user._id });
  } else if (user.role === 'doctor') {
    await Doctor.findOneAndDelete({ user: user._id });
  }

  res.status(200).json({ success: true, message: 'User deleted' });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phone, profile = {} } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) throw new ApiError(404, 'User not found');

  user.fullName = fullName ?? user.fullName;
  user.email = email ?? user.email;
  user.phone = phone ?? user.phone;
  await user.save();

  let updatedProfile = null;
  if (user.role === 'patient') {
    const patient = await Patient.findOne({ user: user._id });
    if (patient) {
      const allowedPatientFields = [
        'nicPassport',
        'age',
        'gender',
        'address',
        'bloodGroup',
        'dateOfBirth',
        'emergencyContact',
        'medicalHistory',
        'phone'
      ];

      for (const key of allowedPatientFields) {
        if (profile[key] !== undefined) {
          patient[key] = profile[key];
        }
      }

      patient.fullName = user.fullName;
      patient.phone = user.phone;
      await patient.save();
      updatedProfile = patient;
    }
  } else if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: user._id });
    if (doctor) updatedProfile = doctor;
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toObject(),
      profile: updatedProfile
    }
  });
});

export const deleteMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.role === 'patient') {
    await Patient.findOneAndDelete({ user: user._id });
  } else if (user.role === 'doctor') {
    await Doctor.findOneAndDelete({ user: user._id });
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: 'Your profile has been deleted'
  });
});
