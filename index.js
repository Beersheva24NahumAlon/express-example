import express from "express";
import Joi from "joi";
import morgan from "morgan";
import fs from "node:fs";

//valitadion settings
const schemaPost = Joi.object({
    "id": Joi.string().alphanum().pattern(new RegExp(/^J\d{3}/)).required(),
    "name": Joi.string().valid("Back-End", "Front-End", "Java", "Node", "AWS", "C++"),
    "lecturer": Joi.string().valid("Vasya", "Petya", "Olya", "Vova"),
    "hours": Joi.number().min(50).max(600).required()
});
const schemaPut = Joi.object({
    "id": Joi.string().alphanum().pattern(new RegExp(/^J\d{3}/)),
    "name": Joi.string().valid("Back-End", "Front-End", "Java", "Node", "AWS", "C++"),
    "lecturer": Joi.string().valid("Vasya", "Petya", "Olya", "Vova"),
    "hours": Joi.number().min(50).max(600)
});
//initialization
const courses = {
    J101: { id: "J101", name: "Back-End", lecturer: "Vasya", hours: 300 },
    J102: { id: "J102", name: "Front-End", lecturer: "Petya", hours: 200 },
    J103: { id: "J103", name: "Java", lecturer: "Olya", hours: 100 },
    J104: { id: "J104", name: "Node", lecturer: "Petya", hours: 200 },
    J105: { id: "J105", name: "AWS", lecturer: "Vova", hours: 100 },
    J106: { id: "J106", name: "C++", lecturer: "Petya", hours: 300 }
};
//constants
const port = process.env.PORT ?? 3500
const fileStream = fs.createWriteStream("log.txt");
//main variable of express (http-server)
const app = express();
//functions
function valitator(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            throw createError(400, error.details.map(o => o.message).join(", "));
        }
        next();
    };
}
function expressValidator(schemasObj) {
    return (req, res, next) => {
        if (req._body) {
            const { error } = schemasObj[req.method].validate(req.body, { abortEarly: false });
            if (error) {
                req.errorMessage = error.details.map(o => o.message).join(", ");
            }
            req.validated = true;
        }
        next();
    }
}
function valid(req, res, next) {
    if (!req.validated) {
        throw createError(500, "server hasn't validated request");
    }
    if (req.errorMessage) {
        throw createError(400, req.errorMessage);
    }
    next();
}
function createError(status, message) {
    return { status, message };
}
function errorHandler(error, req, res, next) {
    let { status, message } = error;
    status = status ?? 500;
    message = message ?? `internal server error ${error}`;
    res.status(status).send(message);
}
function throwNotFound(id) {
    if (!courses[id]) {
        throw createError(404, `course with id ${id} doesn't exist`);
    }
}
function throwAlreadyExists(id) {
    if (courses[id]) {
        throw createError(400, `course with id ${id} already exists`);
    }
}
//used middleware
app.use(express.json());
app.use(morgan("combined", { stream: fileStream}));
app.use(expressValidator({ "POST": schemaPost, "PUT": schemaPut }));
//subscribing URLs (routing)
app.post("/api/v1/courses", valitator(schemaPost), (req, res) => {
    const id = req.body.id;
    throwAlreadyExists(id);
    courses[id] = req.body;
    console.log(courses);
    res.status(201).send(courses[id]);
});
app.get("/api/v1/courses/:id", (req, res) => {
    const id = req.params.id;
    throwNotFound(id);
    res.status(200).send(courses[id]);
});
app.delete("/api/v1/courses/:id", (req, res) => {
    const id = req.params.id;
    throwNotFound(id);
    delete courses[id];
    console.log(courses);
    res.status(200);
    res.send(`course with id ${id} deleted`);
});
app.put("/api/v1/courses/:id", valid, (req, res) => {
    const id = req.body.id;
    throwNotFound(id);
    courses[id] = { ...courses[id], ...req.body };
    res.status(200);
    res.send(req.body);
});
app.get("/api/v1/courses", (req, res) => {
    const { lecturer, hours, name } = req.query;
    res.send(Object.values(courses).filter((c) => (lecturer ? c.lecturer == lecturer : true) && (hours ? c.hours == hours : true) && (name ? c.name == name : true)
    ));
});
// last middleware in chain
app.use(errorHandler);
//run http-server
app.listen(port, () => console.log(`server is listening on port ${port}`));