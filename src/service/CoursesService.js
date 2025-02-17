import { createError } from "../errors/errors.js";

class CoursesService {
    #courses

    constructor(courses = {}) {
        this.#courses = courses;
    }

    addCourse(course) {
        const id = course.id;
        this.#throwAlreadyExists(id);
        this.#courses[id] = course;
        return this.#courses[id];
    }

    findCourses(filter) {
        const { lecturer, hours, name } = filter;
        return Object.values(this.#courses).filter((c) => (lecturer ? c.lecturer == lecturer : true) &&
            (hours ? c.hours == hours : true) &&
            (name ? c.name == name : true));
    }

    getCourse(id) {
        this.#throwNotFound(id);
        return this.#courses[id]; 
    }

    removeCourse(id) {
        this.#throwNotFound(id);
        const res = this.#courses[id];
        delete this.#courses[id];
        return res;
    }

    updateCourse(id, updateObj) {
        this.#throwNotFound(id);
        this.#courses[id] = { ...this.#courses[id], ...updateObj };
        return this.#courses[id];
    }

    #throwNotFound(id) {
        if (!this.#courses[id]) {
            throw createError(404, `course with id ${id} doesn't exist`);
        }
    }

    #throwAlreadyExists(id) {
        if (this.#courses[id]) {
            throw createError(400, `course with id ${id} already exists`);
        }
    }
}

const init = {
    J101: { id: "J101", name: "Back-End", lecturer: "Vasya", hours: 300 },
    J102: { id: "J102", name: "Front-End", lecturer: "Petya", hours: 200 },
    J103: { id: "J103", name: "Java", lecturer: "Olya", hours: 100 },
    J104: { id: "J104", name: "Node", lecturer: "Petya", hours: 200 },
    J105: { id: "J105", name: "AWS", lecturer: "Vova", hours: 100 },
    J106: { id: "J106", name: "C++", lecturer: "Petya", hours: 300 }
};

const service = new CoursesService(init);
export default service;