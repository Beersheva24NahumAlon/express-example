const coursesPaths = {
    POST: {
        authentication: req => "jwt",
        authorization: req => req.role === "ADMIN"
    }, 
    PUT: {
        authentication: req => "jwt",
        authorization: req => req.role === "ADMIN"
    },
    GET: {
        authentication: req => "jwt",
        authorization: req => true
    },
    DELETE: {
        authentication: req => "jwt",
        authorization: req => req.role === "ADMIN"
    },
};
export default coursesPaths;