import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import Department from '../models/department.model.js';
import Appointment from '../models/appointment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalDepartments = await Department.countDocuments();
  const totalUsers = await User.countDocuments();
  
  const revenueAggregation = await Appointment.aggregate([
    {
      $match: {
        status: { $in: ['booked', 'completed'] }
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorInfo'
      }
    },
    {
      $unwind: {
        path: '$doctorInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $ifNull: ['$doctorInfo.consultationFee', 0] }
        }
      }
    }
  ]);
  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

  const recentRegistrations = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('fullName role createdAt');

  const genderStats = await Patient.aggregate([
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalUsers,
        totalRevenue
      },
      recentRegistrations,
      genderStats
    }
  });
});
