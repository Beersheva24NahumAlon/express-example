const objPutDelete = {
    authentication: req => "basic",
    authorization: req => req.user === process.env.ADMIN_USERNAME || req.user === req.body.username
};
const accountsPaths = {
    POST: {
        authentication: req => req.path.includes("Admin") ? "basic" : "",
        authorization: req => req.path.includes("Admin") ? req.user === process.env.ADMIN_USERNAME : true
    }, 
    PUT: objPutDelete,
    GET: {
        authentication: req => "basic",
        authorization: req => req.user === process.env.ADMIN_USERNAME
    },
    DELETE: objPutDelete
};
export default accountsPaths;