import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Router is working fine",
  });
});

export const userRoutes = router;
