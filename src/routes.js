const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { storeData, getData } = require("./storeData");
const { loadModel, predict } = require("./inference");

const router = express.Router();

const upload = multer({
  limits: { fileSize: 1000000 },
}).single("image");

router.post("/", async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, function (err) {
        if (err) {
          if (
            err instanceof multer.MulterError &&
            err.code === "LIMIT_FILE_SIZE"
          ) {
            return reject({
              status: 413,
              message:
                "Payload content length greater than maximum allowed: 1000000",
            });
          }
          return reject({
            status: 400,
            message: "An error occurred during file upload. Please try again.",
          });
        }
        resolve();
      });
    });

    const image = req.file;

    if (!image) {
      console.log("No image uploaded");
      return res.status(400).json({
        status: "fail",
        message: "Image not uploaded. Please try again.",
      });
    }

    console.log("Image uploaded successfully");
    console.log("Loading model...");
    const model = await loadModel();
    console.log("Model loaded successfully");

    console.log("Making prediction...");
    const predictions = await predict(model, image.buffer);

    console.log("Predictions received:", predictions);
    const { result } = predictions;

    let suggestion = "";
    if (result === "Cancer") {
      suggestion = "Segera periksa ke dokter!";
    } else {
      suggestion = "Penyakit kanker tidak terdeteksi.";
    }

    let data = {
      id: crypto.randomUUID(),
      result,
      suggestion,
      createdAt: new Date(),
    };
    console.log("Calling storeData function...");
    await storeData(data.id, data);
    console.log("Data successfully stored in Firestore");

    return res.status(201).json({
      status: "success",
      message: "Model is predicted successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error occurred:", error);

    if (error.status) {
      return res.status(error.status).json({
        status: "fail",
        message: error.message,
      });
    }

    return res.status(400).json({
      status: "fail",
      message: "Terjadi kesalahan dalam melakukan prediksi",
    });
  }
});

router.get("/histories", async (req, res) => {
  try {
    const result = await getData();

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {}
});

module.exports = router;
