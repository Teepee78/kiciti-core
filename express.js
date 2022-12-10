import express from 'express';

// import routes
import usersRouter from "./routes/users.js";

// import custom middlewares
import logger from "./middlewares/logger.js";

// import external middlewares
import cookieParser from 'cookie-parser';

// define app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(logger);

// routes
app.use("/api/users", usersRouter);

// export app
export default app;
