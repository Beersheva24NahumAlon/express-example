export function convertToMongoObject(nameId, object) {
    const res = {...object};
    res._id = object[nameId];
    delete res[nameId];
    return res;
}

export function convertFromMongoObject(nameId, mongoObject) {
    const res = {...mongoObject};
    res[nameId] = mongoObject._id;
    delete res._id;
    return res;
}