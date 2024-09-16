import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import router from "./app/routes";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middleWears/globalErrorHandler";

const app: Application = express();
app.use(cors());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);
app.use(globalErrorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Arkham healthcare Server",
  });
});

export default app;
