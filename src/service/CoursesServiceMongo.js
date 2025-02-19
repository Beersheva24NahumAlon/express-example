import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import { convertToMongoObject, convertFromMongoObject } from "../db/dbUtils.js";

class CoursesServiceMongo {
    #courses

    constructor() {
        this.#courses = mongoConnection.getCollection(process.env.COURSES_COLLECTION);;
    }

    async addCourse(course) {
        try {
            const mongoCourse = convertToMongoCourse(course);
            const res = await this.#courses.insertOne(mongoCourse);
            return course;
        } catch (error) {
            throw createError(400, `course with id ${course.id} already exists`);
        }
    }

    async findCourses(filter) {
        const newFilter = {...filter};
        if (newFilter.hours) {
            newFilter.hours = parseInt(newFilter.hours);
        }
        const mongoCourses = await this.#courses.find(newFilter).toArray();
        return mongoCourses.map(c => convertFromMongoCourse(c));
    }

    async getCourse(id) {
        const mongoCourse = await this.#courses.findOne({ _id: id });
        this.#throwNotFound(id, mongoCourse);
        return convertFromMongoCourse(mongoCourse);
    }

    async removeCourse(id) {
        const mongoCourse = await this.#courses.findOneAndDelete({ _id: id });
        this.#throwNotFound(id, mongoCourse);
        return convertFromMongoCourse(mongoCourse);
    }

    async updateCourse(id, course) {
        const mongoCourse = await this.#courses.findOneAndUpdate(
            { _id: id }, 
            { $set: convertToMongoCourse(course) }, 
            { returnDocument: "after" }
        );
        this.#throwNotFound(id, mongoCourse);
        return convertFromMongoCourse(mongoCourse);
    }

    #throwNotFound(id, mongoCourse) {
        if (!mongoCourse) {
            throw createError(404, `course with id ${id} doesn't exist`);
        }
    }
}

function convertToMongoCourse(course) {
    return convertToMongoObject("id", course);
} 

function convertFromMongoCourse(mongoCourse) {
    return convertFromMongoObject("id", mongoCourse);
} 

const service = new CoursesServiceMongo();
export default service;