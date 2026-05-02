import Department from '../models/department.model.js';
import Doctor from '../models/doctor.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find();
  
  // Attach doctor counts to each department
  const deptsWithCounts = await Promise.all(departments.map(async (dept) => {
    const doctorCount = await Doctor.countDocuments({ department: dept.name });
    return {
      ...dept.toObject(),
      doctorCount
    };
  }));

  res.status(200).json({
    success: true,
    data: deptsWithCounts
  });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const existing = await Department.findOne({ name });
  if (existing) {
    throw new ApiError(400, 'Department already exists');
  }

  const department = await Department.create({ name, description, icon });

  res.status(201).json({
    success: true,
    data: department
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, icon, status } = req.body;
  
  const department = await Department.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  department.name = name || department.name;
  department.description = description || department.description;
  department.icon = icon || department.icon;
  department.status = status || department.status;

  await department.save();

  res.status(200).json({
    success: true,
    data: department
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully'
  });
});
