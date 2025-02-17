import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
import config from "config";

const validCourse = {
    "id": Joi
        .string()
        .alphanum()
        .pattern(new RegExp(/^J\d{3}/)),
    "name": Joi
        .string()
        .valid("Back-End", "Front-End", "Java", "Node", "AWS", "C++"),
    "lecturer": Joi
        .string()
        .valid("Vasya", "Petya", "Olya", "Vova"),
    "hours": Joi
        .number()
        .min(50)
        .max(600)
};
export const schemaPut = Joi.object(validCourse);
export const schemaPost = Joi.object({...validCourse,
    "id": validCourse.id.required(),
    "hours": validCourse.hours.required()
});
const joiPassword = Joi.extend(joiPasswordExtendCore);
const schemaPassword = joiPassword
    .string()
    .min(8)
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .onlyLatinCharacters()
    .doesNotInclude(["password", "12345"])
    .required();
const schemaEmail = Joi
    .string()
    .email()
    .required();
export const schemaAccount = Joi.object({
    "username": schemaEmail,
    "password": schemaPassword,
    "role": Joi
        .string()
        .valid(...config.get("accounting.roles"))
});
export const schemaGetAccount = Joi.object({
    "username": schemaEmail
});