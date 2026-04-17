const axios = require("axios");
const fs = require("fs");

function collectPredictions(value, acc = []) {
  if (!value) return acc;

  if (Array.isArray(value)) {
    value.forEach((item) => collectPredictions(item, acc));
    return acc;
  }

  if (typeof value === "object") {
    const hasConfidence = typeof value.confidence === "number";
    const className = value.class || value.class_name || value.label;
    if (hasConfidence && className) {
      acc.push({ confidence: value.confidence, class: className });
    }

    Object.values(value).forEach((child) => collectPredictions(child, acc));
  }

  return acc;
}

async function analyzeImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const workspace = process.env.ROBOFLOW_WORKSPACE || "stocios-workspace";
  const model = process.env.ROBOFLOW_MODEL || "trash-detection-pipeline-1776400672726";
  const endpoint = `https://serverless.roboflow.com/${workspace}/workflows/${model}`;

  const response = await axios.post(
    endpoint,
    {
      api_key: process.env.ROBOFLOW_API_KEY,
      inputs: {
        image: { type: "base64", value: base64Image },
      },
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  // Debug: inspect workflow response shape and extracted predictions.
  console.log("[roboflow] raw response keys:", Object.keys(response.data || {}));
  const predictions = collectPredictions(response.data);
  console.log("[roboflow] extracted predictions:", predictions);
  if (!predictions || predictions.length === 0) {
    const fallbackClass = String(response.data?.predicted_class || response.data?.label || "").toLowerCase() || null;
    const fallbackConfidenceRaw = Number(
      response.data?.confidence ?? response.data?.score ?? response.data?.outputs?.[0]?.confidence ?? 0,
    );
    return {
      confidenceScore: Math.round(fallbackConfidenceRaw * (fallbackConfidenceRaw <= 1 ? 100 : 1)),
      predictedClass: fallbackClass,
    };
  }

  const topPrediction = predictions.reduce((best, current) => {
    return current.confidence > best.confidence ? current : best;
  });

  return {
    confidenceScore: Math.round(topPrediction.confidence * 100),
    predictedClass: String(topPrediction.class || "").toLowerCase() || null,
  };
}

module.exports = { analyzeImage };
