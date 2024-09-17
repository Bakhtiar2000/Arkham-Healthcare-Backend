import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middleWears/globalErrorHandler";
import notFound from "./app/middleWears/notFound";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(cors());
app.use(cookieParser());

// Parsers / MiddleWears
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use(notFound);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Arkham healthcare Server",
  });
});

export default app;
