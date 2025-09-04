import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import notFound from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import SocketHandler from "./socket/socketHandler.js";

import documents from "./routes/documents.js";
import documentUploads from "./routes/documentUpload.js";
import users from "./routes/users.js";
import policies from "./routes/policies.js";
import qnas from "./routes/questionnaireTemplates.js";
import claims from "./routes/claims.js";
import messages from "./routes/messages.js";
import notifications from "./routes/notifications.js"
import cors from "cors";

dotenv.config();

const app = express();
const server = createServer(app);

let socketHandler;

//middleware
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CORS middleware (add this if you'll have a frontend later)
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:3000");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
//   next();
// });
//app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',  // frontend URL
  credentials: true,                // allow cookies/auth headers
}));

//routes
app.use("/api/v1/documents", documents);
app.use("/api/v1/files", documentUploads);
app.use("/api/v1/users", users);
app.use("/api/v1/policies", policies);
app.use("/api/v1/questionnaireTemplates", qnas);
app.use("/api/v1/claims", claims);
app.use("/api/v1/messages", messages);
app.use("/api/v1/notifications", notifications);

app.use(notFound);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
      socketHandler = new SocketHandler(server);
      console.log("Socket.IO initialized successfully");
    });
  } catch (error) {
    console.log(error);
  }
};

export { socketHandler };

start();
