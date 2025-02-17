import express from "express";
import { logger } from "../loggers/logger.js";
import { errorHandler } from "../errors/errors.js";
import { expressValidator } from "../middleware/validation.js";
import { schemaPost, schemaPut } from "../validation/schemas.js";
import coursesRouter from "../routes/courses.js";
import accountsRouter from "../routes/accounts.js";
import { authenticate } from "../middleware/auth.js";

//constants
const port = process.env.PORT ?? 3500

//main variable of express (http-server)
const app = express();

//used middleware
app.use(express.json());
app.use(logger);
app.use(authenticate());
app.use("/api/v1/courses", coursesRouter);
app.use("/accounts/", accountsRouter);
app.use((req, res) => res.status(404).send(`path ${req.path} is not found`));
app.use(errorHandler);

//run http-server
app.listen(port, () => console.log(`server is listening on port ${port}`));