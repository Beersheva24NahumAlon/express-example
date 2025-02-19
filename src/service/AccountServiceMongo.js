import { createError } from "../errors/errors.js";
import config from "config";
import bcrypt from "bcrypt";
import JwtUtils from "../security/JwtUtils.js";
import mongoConnection from "../db/MongoConnection.js";
import { convertFromMongoObject, convertToMongoObject } from "../db/dbUtils.js";

const userRole = config.get("accounting.user_role");
const adminRole = config.get("accounting.admin_role");
const time_units = {
    "d": 1000 * 60 * 60 * 24,
    "h": 1000 * 60 * 60,
    "m": 1000 * 60,
    "s": 1000
}
class AccountServiceMongo {
    #accounts

    constructor() {
        this.#accounts = mongoConnection.getCollection(process.env.ACCOUNTS_COLLECTION);;
    }

    async addAdminAccount(account) {
        await this.#addAccount(account, account.role ?? adminRole);
    }

    async addUserAccount(account) {
        await this.#addAccount(account, userRole);
    }

    async #addAccount(account, role) {
        try {
            if (account.username == process.env.ADMIN_USERNAME) {
                throw Error();
            }
            const serviceAccount = this.#toServiceAccount(account, role);
            const mongoAccount = convertToMongoAccount(serviceAccount);
            const res = await this.#accounts.insertOne(mongoAccount);
        } catch (error) {
            throw createError(400, `account with e-mail ${account.username} already exists`);
        }
    }

    async updateAccount(account) {
        // const mongoAccount = await this.#accounts.findOneAndUpdate(
        //     { _id: account.username }, 
        //     { $set: convertToMongoAccount(account) }, 
        //     { returnDocument: "after" }
        // );
        // this.#throwNotFound(id, mongoAccount);
        // return convertFromMongoAccount(mongoAccount);

        // const username = account.username;
        // const serviceAccount = this.getAccount(username);
        // this.#updatePassword(serviceAccount, account.password);
    }

    async getAccount(username) {
        const mongoAccount = await this.#accounts.findOne({ _id: username });
        this.#throwNotFound(username, mongoAccount);
        return convertFromMongoAccount(mongoAccount);
    }

    async login(account) {
        const { username, password } = account;
        const serviceAccount = this.#accounts[username];
        await this.checkLogin(serviceAccount, password);
        return JwtUtils.getJwt(this.#accounts[account.username]);
    }

    async removeAccount(username) {
        await this.#accounts.findOneAndDelete({ _id: username });
    }

    async checkLogin(serviceAccount, password) {
        if (!serviceAccount || ! await bcrypt.compare(password, serviceAccount.hashPassword)) {
            throw createError(400, "wrong credential");
        }
        if (new Date().getTime() > serviceAccount.expiration) {
            throw createError(400, "password expired");
        }
    }

    #updatePassword(serviceAccount, password) {
        if (bcrypt.compareSync(password, serviceAccount.hashPassword)) {
            throw createError(400, `the new password should be diffenet from the existing one`);
        }
        const hashPassword = bcrypt.hashSync(password, config.get("accounting.salt_rounds"));
        const expiration = getExpiration();
        return {hashPassword, expiration};
    }

    #toServiceAccount(account, role) {
        const hashPassword = bcrypt.hashSync(account.password, config.get("accounting.salt_rounds"));
        const expiration = getExpiration();
        const serviceAccount = { username: account.username, role, hashPassword, expiration };
        return serviceAccount;
    }

    #throwNotFound(username, mongoAccount) {
        if (!mongoAccount) {
            throw createError(404, `account with e-mail ${username} doesn't exist`);
        }
    }
}

function getExpiration() {
    const expiresIn = getExpiresIn();
    return new Date().getTime() + expiresIn;
}

const accountService = new AccountServiceMongo();
export default accountService;

export function getExpiresIn() {
    const expiredInStr = config.get("accounting.expired_in");
    const amount = expiredInStr.split(/\D/)[0];
    const parseArray = expiredInStr.split(/\d/);
    const index = parseArray.findIndex(e => !!e.trim());
    const unit = parseArray[index];
    const unitValue = time_units[unit];
    if (unitValue == undefined) {
        throw createError(500, `wrong configation: unit ${unit} doesn't exist`);
    }
    return amount * unitValue;
}

function convertToMongoAccount(account) {
    return convertToMongoObject("username", account);
}

function convertFromMongoAccount(mongoAccount) {
    return convertFromMongoObject("username", mongoAccount);
}
