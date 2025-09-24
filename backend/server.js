import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";

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
import notifications from "./routes/notifications.js";
import reports from "./routes/reports.js";
import vapi from "./routes/vapi.js"
import chatbot from "./routes/chatbot.js";

dotenv.config();

const app = express();
const server = createServer(app);

let socketHandler;

//middleware
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://10.36.228.250:5173',
    process.env.CLIENT_URL
  ].filter(Boolean),  // Remove any undefined values
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
app.use("/api/v1/reports", reports);
app.use("/api/v1/vapi", vapi);
app.use("/api/v1/chatbot", chatbot);

app.use(notFound);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, "0.0.0.0", () => {
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
