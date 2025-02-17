import { createError } from "../errors/errors.js";

export function valitator(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            throw createError(400, error.details.map(o => o.message).join(", "));
        }
        next();
    };
}
export function expressValidator(schemasObj) {
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
export function valid(req, res, next) {
    if (!req.validated) {
        throw createError(500, "server hasn't validated request");
    }
    if (req.errorMessage) {
        throw createError(400, req.errorMessage);
    }
    next();
}