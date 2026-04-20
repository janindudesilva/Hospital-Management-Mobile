export const predictDisease = async (symptoms) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceUrl) {
    return {
      predicted_category: 'Service not configured',
      confidence: 0,
      recommended_specialist: 'General Physician',
      top_predictions: []
    };
  }

  const response = await fetch(`${aiServiceUrl}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(symptoms)
  });

  if (!response.ok) {
    throw new Error('Prediction service request failed');
  }

  return response.json();
};
