import express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// app.use(cors()) allows your frontend (browser) to call your backend API.
// Without it, the browser blocks the request.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
// cookie-parser is middleware that reads cookies sent by the browser and makes them available in req.cookies..
app.use(cookieParser());
// “Accept JSON data in requests, but maximum size = 10 MB.
app.use(
  express.json({
    limit: "10mb",
  }),
);
// It lets Express read form data (URL-encoded data) sent from the client and puts it into:
// req.body
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.static("public"));

//
import userRoutes from "./routes/user.js";
import subscriptionRoutes from "./routes/subscription.js";
import likeRoutes from "./routes/like.js";
import commentRoutes from "./routes/comment.js";

// routed declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
// whenever user clicks /users it goes to userroutes then in userrouter control is pass to some controller and pass to controller
// router meh bhi route hota hai
// /users/register -> userRoutes -> userController -> registerUser function
export { app };

// app.use is mainly used for configuration or middlewares
