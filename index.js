const routes = require("./src/routes");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/predict", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
