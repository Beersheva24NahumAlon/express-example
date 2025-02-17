import { createError } from "../errors/errors.js";
import config from "config";
import bcrypt from "bcrypt";
import JwtUtils from "../security/JwtUtils.js";

const userRole = config.get("accounting.user_role"); 
const adminRole = config.get("accounting.admin_role");
const time_units = {
    "d": 1000 * 60 * 60 * 24,
    "h": 1000 * 60 * 60,
    "m": 1000 * 60,
    "s": 1000
}
class AccountService {
    #accounts

    constructor(accounts = {}) {
        this.#accounts = accounts;
    }

    addAdminAccount(account) {
        this.#addAccount(account, account.role ?? adminRole);
    }

    addUserAccount(account) {
        this.#addAccount(account, userRole);
    }

    #addAccount(account, role) {
        const username = account.username;
        if (this.#accounts[username] || username == process.env.ADMIN_USERNAME) {
            throw createError(409, `account with e-mail ${username} already exists`);
        }
        const serviceAccount = this.#toServiceAccount(account, role);
        this.#accounts[username] = serviceAccount;
    }

    updateAccount(account) {
        const username = account.username;
        const serviceAccount = this.getAccount(username);
        this.#updatePassword(serviceAccount, account.password); 
    }

    getAccount(username) {
        const serviceAccount = this.#accounts[username];
        if (!serviceAccount) {
            throw createError(404, `account with e-mail ${username} doesn't exist`);
        }
        return serviceAccount;
    }

    async login(account) {
        const {username, password} = account;
        const serviceAccount = this.#accounts[username];
        await this.checkLogin(serviceAccount, password);
        return JwtUtils.getJwt(this.#accounts[account.username]);
    }

    removeAccount(username) {
        this.getAccount(username);
        delete this.#accounts[username];
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
        serviceAccount.hashPassword = bcrypt.hashSync(password, config.get("accounting.salt_rounds"));
        serviceAccount.expiration = getExpiration();
    }

    #toServiceAccount(account, role) {
        const hashPassword = bcrypt.hashSync(account.password, config.get("accounting.salt_rounds"));
        const expiration = getExpiration();
        const serviceAccount = { username: account.username, role, hashPassword, expiration };
        return serviceAccount;
    }
}

function getExpiration() {
    const expiresIn = getExpiresIn();
    return new Date().getTime() + expiresIn;
}
const init = {
    "user@gmail.com": {
        "username": "user@gmail.com",
        "role": "USER",
        "hashPassword": "$2b$10$IUfvH3NqaGviOo8R/EqemeDgU.l9d7t388TbiWa/Bo3TeFqAQzSL.",
        "expiration": 9739791506306
    },
    "admin@gmail.com": {
        "username": "admin@gmail.com",
        "role": "ADMIN",
        "hashPassword": "$2b$10$Gn84xtbMcgEppLn1qtvQY.pF6cxNaEDUcXCjadsFOBqI4aa0Wov1y",
        "expiration": 9739791690471
    }
};
const accountService = new AccountService(init);
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
    return  amount * unitValue;
}
