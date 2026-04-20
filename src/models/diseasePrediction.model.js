import mongoose from 'mongoose';

const diseasePredictionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    symptoms: {
      type: Object,
      required: true
    },
    predictedCategory: String,
    recommendedSpecialist: String,
    confidence: Number,
    topPredictions: [
      {
        category: String,
        confidence: Number
      }
    ]
  },
  { timestamps: true }
);

const DiseasePrediction = mongoose.model('DiseasePrediction', diseasePredictionSchema);
export default DiseasePrediction;
