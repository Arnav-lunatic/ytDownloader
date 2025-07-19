import express from "express";
import ytVideo from "./routes/ytVideo.js";

const app = express();
const port = process.env.PORT || 8000;

app.use("/api/videos", ytVideo);

app.listen(port, () => {
	console.log(`listening at PORT: ${port}`);
});
