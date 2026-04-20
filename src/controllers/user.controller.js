import Patient from '../models/patient.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const patientProfile = await Patient.findOne({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      patientProfile
    }
  });
});
