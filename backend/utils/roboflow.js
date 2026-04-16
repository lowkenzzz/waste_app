const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function analyzeImage(imagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));

  const response = await axios.post(
    `https://detect.roboflow.com/${process.env.ROBOFLOW_MODEL}`,
    form,
    {
      params: { api_key: process.env.ROBOFLOW_API_KEY },
      headers: form.getHeaders(),
    },
  );

  const predictions = response.data?.predictions;
  if (!predictions || predictions.length === 0) return 0;

  const maxConfidence = Math.max(...predictions.map((p) => p.confidence));
  return Math.round(maxConfidence * 100);
}

module.exports = { analyzeImage };
