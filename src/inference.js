const tf = require("@tensorflow/tfjs-node");
const sharp = require("sharp");
const path = require("path");

async function loadModel() {
  try {
    const modelUrl = process.env.BUCKET_URL;
    const model = await tf.loadGraphModel(modelUrl);
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw new Error("Failed to load model");
  }
}

async function predict(model, imageBuffer) {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Invalid or empty image buffer");
    }

    const tensor = tf.node
      .decodePng(imageBuffer)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const classes = ["Cancer", "Non-cancer"];

    const predictions = await model.predict(tensor).data();

    const predictionValue = predictions[0];

    const result = predictionValue > 0.5 ? classes[0] : classes[1];

    console.log(
      "Prediction result:",
      result,
      "with confidence:",
      predictionValue
    );

    return {
      result,
      confidence: predictionValue,
    };
  } catch (error) {
    console.error("Error during prediction:", error.message);
    throw new Error("Failed to make prediction");
  }
}

module.exports = { loadModel, predict };
