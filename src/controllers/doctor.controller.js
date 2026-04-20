import Doctor from '../models/doctor.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDoctors = asyncHandler(async (req, res) => {
  const { specialization, department } = req.query;
  const filters = { isActive: true };

  if (specialization) filters.specialization = specialization;
  if (department) filters.department = department;

  const doctors = await Doctor.find(filters).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, message: 'Doctor created', data: doctor });
});
