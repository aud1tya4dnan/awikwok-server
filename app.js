import express from "express";
import cors from "cors";
import router from "./controller.js";

const app = express();
const port = 8000;

app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }))

app.use("/", router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

