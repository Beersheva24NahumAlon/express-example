import express from "express";
import { valid, valitator, expressValidator } from "../middleware/validation.js";
import { schemaPost, schemaPut } from "../validation/schemas.js";
import service from "../service/CoursesServiceMongo.js";
import coursesPaths from "../paths/coursesPaths.js";
import { checkAuthentication } from "../middleware/auth.js";
import asyncHandler from "express-async-handler";

const coursesRouterAsync = express.Router(); 

coursesRouterAsync.use(checkAuthentication(coursesPaths));
coursesRouterAsync.use(expressValidator({ "POST": schemaPost, "PUT": schemaPut }));

coursesRouterAsync.post("/", valitator(schemaPost), asyncHandler(async (req, res) => {
    const course = await service.addCourse(req.body)
    res.status(201).send(course);
}));
coursesRouterAsync.get("/:id", asyncHandler(async (req, res) => {
    res.status(200).send(await service.getCourse(req.params.id));
}));
coursesRouterAsync.delete("/:id", asyncHandler(async (req, res) => {
    const course = await service.removeCourse(req.params.id);
    res.status(200).send(course);
}));
coursesRouterAsync.put("/", valid, asyncHandler(async (req, res) => {
    const course = await service.updateCourse(req.body.id, req.body);
    res.status(200).send(course);
}));
coursesRouterAsync.get("/", asyncHandler(async (req, res) => {
    res.send(await service.findCourses(req.query));
}));

export default coursesRouterAsync;