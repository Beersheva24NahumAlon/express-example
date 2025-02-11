import express from "express";
import Joi from "joi";

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

const courses = {
    J101: { id: "J101", name: "Back-End", lecturer: "Vasya", hours: 300 },
    J102: { id: "J102", name: "Front-End", lecturer: "Petya", hours: 200 },
    J103: { id: "J103", name: "Java", lecturer: "Olya", hours: 100 },
    J104: { id: "J104", name: "Node", lecturer: "Petya", hours: 200 },
    J105: { id: "J105", name: "AWS", lecturer: "Vova", hours: 100 },
    J106: { id: "J106", name: "C++", lecturer: "Petya", hours: 300 }
};

const port = process.env.PORT ?? 3500
const app = express();
app.use(express.json());
app.post("/api/v1/courses", (req, res) => {
    const { error } = schemaPost.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).send(error.details.map(o => o.message).join(", "));
    } else {
        const id = req.body.id;
        courses[id] = req.body;
        console.log(courses);
        res.status(201).send(courses[id]);
    }
});
app.get("/api/v1/courses/:id", (req, res) => {
    res.status(200).send(courses[req.params.id]);
});
app.delete("/api/v1/courses/:id", (req, res) => {
    delete courses[req.params.id];
    console.log(courses);
    res.status(200);
    res.send(`course with id ${req.params.id} deleted`);
});
app.put("/api/v1/courses/:id", (req, res) => {
    const { error } = schemaPut.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).send(error.details.map(o => o.message).join(", "));
    } else {
        const id = req.params.id;
        courses[id] = { ...courses[id], ...req.body };
        res.status(200);
        res.send(req.body);        
    }
});
app.get("/api/v1/courses", (req, res) => {
    const { lecturer, hours, name } = req.query;
    res.send(Object.values(courses).filter((c) => (lecturer ? c.lecturer == lecturer : true) && (hours ? c.hours == hours : true) && (name ? c.name == name : true)
    ));
});
app.listen(port, () => console.log(`server is listening on port ${port}`));