import Appointment from '../models/appointment.model.js';
import Patient from '../models/patient.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    throw new ApiError(404, 'Patient profile not found');
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: req.body.doctor,
    appointmentDate: req.body.appointmentDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    type: req.body.type,
    symptoms: req.body.symptoms,
    notes: req.body.notes
  });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment
  });
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    throw new ApiError(404, 'Patient profile not found');
  }

  const appointments = await Appointment.find({ patient: patient._id })
    .populate('doctor')
    .sort({ appointmentDate: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});
