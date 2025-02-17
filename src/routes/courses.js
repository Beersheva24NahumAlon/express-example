import express from "express";
import { valid, valitator, expressValidator } from "../middleware/validation.js";
import { schemaPost, schemaPut } from "../validation/schemas.js";
import service from "../service/CoursesService.js";
import coursesPaths from "../paths/coursesPaths.js";
import { checkAuthentication } from "../middleware/auth.js";

const coursesRouter = express.Router(); 

coursesRouter.use(checkAuthentication(coursesPaths));
coursesRouter.use(expressValidator({ "POST": schemaPost, "PUT": schemaPut }));

coursesRouter.post("/", valitator(schemaPost), (req, res) => {
    const course = service.addCourse(req.body)
    res.status(201).send(course);
});
coursesRouter.get("/:id", (req, res) => {
    res.status(200).send(service.getCourse(req.params.id));
});
coursesRouter.delete("/:id", (req, res) => {
    const course = service.removeCourse(req.params.id);
    res.status(200).send(course);
});
coursesRouter.put("/:id", valid, (req, res) => {
    const course = service.updateCourse(req.body.id, req.body);
    res.status(200).send(course);
});
coursesRouter.get("/", (req, res) => {
    res.send(service.findCourses(req.query));
});

export default coursesRouter;