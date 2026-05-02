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

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  res.status(200).json({ success: true, message: 'Doctor updated', data: doctor });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  res.status(200).json({ success: true, message: 'Doctor deleted' });
});
