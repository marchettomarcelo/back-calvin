import express from "express";

import { Router, Request, Response } from "express";
import generateCalvinResponse from "./ai/ai";

const app = express();

const route = Router();

app.use(express.json());

route.get("/", (req: Request, res: Response) => {
	res.json({ message: "hello world with Typescript" });
});

route.post("/generate", async (req: Request, res: Response) => {
    console.log(req.body.question);
	const respoonse = await generateCalvinResponse({ question: req.body.question });
	res.json({ respoonse });
});

app.use(route);

app.listen(3000, () => console.log("server running on port 3000"));
