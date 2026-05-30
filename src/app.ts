import express, { type Application, type Request, type Response } from "express";
import { issuesRoute } from "./modules/issues/issues.route";
import { authRoute } from "./modules/auth/auth.route";
const app : Application = express();

app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({extended:true}))

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    meassage: "Batch 7 assignment 2",
    author: "next level team",
  });
});

app.use("/api/issues", issuesRoute)
app.use("/api/auth", authRoute)

export default app;