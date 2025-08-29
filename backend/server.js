import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import notFound from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import documents from "./routes/documents.js";
import documentUploads from "./routes/documentUpload.js";
import users from "./routes/users.js"

const app = express();
dotenv.config();

//middleware
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/v1/documents", documents);
app.use("/api/v1/files", documentUploads);
app.use("/api/v1/users", users);

app.use(notFound);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();