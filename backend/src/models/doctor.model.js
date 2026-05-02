import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fullName: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true,
      index: true
    },
    qualification: String,
    experience: String,
    department: {
      type: String,
      required: true
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    phone: String,
    email: String,
    availableDays: [String],
    availableFrom: String,
    availableTo: String,
    maxPatientsPerDay: {
      type: Number,
      default: 20
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
