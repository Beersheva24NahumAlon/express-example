import { MongoClient } from "mongodb"

const { MONGO_PASSWORD, MONGO_USER, MONGO_CLUSTER, DB_NAME } = process.env;

class MongoConnection {
    #client
    #db

    constructor(connectionStr, dbName) {
        this.#client = new MongoClient(connectionStr);
        this.#db = this.#client.db(dbName);
    }

    getCollection(collectionName) {
        return this.#db.collection(collectionName);
    }

    async close() {
        await this.#client.close();
    }
}

const connectionStr = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER.toLowerCase()}.dvztv.mongodb.net/?retryWrites=true&w=majority&appName=${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionStr, DB_NAME);
export default mongoConnection;