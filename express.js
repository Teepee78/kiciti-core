import express from 'express';
import cors from 'cors';

// import routes
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

// import custom middlewares
import logger from "./middlewares/logger.js";

// import external middlewares
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cookieParser from 'cookie-parser';


// swagger js doc options
const options = {
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kiciti-core',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};
const openapiSpecification = swaggerJsdoc(options);

// define app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification, { explorer: true }));
app.use(cookieParser());
app.use(logger);

// routes
app.use("/api/users", usersRouter);
app.use("/api", authRouter);

// export app
export default app;
