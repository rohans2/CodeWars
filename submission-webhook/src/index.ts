import express from "express";

const app = express();

app.get("/submission", (req, res) => {
  console.log("Received a submission!");
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});