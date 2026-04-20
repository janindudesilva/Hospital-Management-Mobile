import Patient from '../models/patient.model.js';
import DiseasePrediction from '../models/diseasePrediction.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { predictDisease } from '../services/prediction.service.js';

export const createPrediction = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    throw new ApiError(404, 'Patient profile not found');
  }

  const result = await predictDisease(req.body);

  const prediction = await DiseasePrediction.create({
    patient: patient._id,
    symptoms: req.body,
    predictedCategory: result.predicted_category,
    recommendedSpecialist: result.recommended_specialist,
    confidence: result.confidence,
    topPredictions: (result.top_predictions || []).map((item) => ({
      category: item.category,
      confidence: item.confidence
    }))
  });

  res.status(201).json({
    success: true,
    message: 'Prediction completed',
    data: prediction,
    result
  });
});
