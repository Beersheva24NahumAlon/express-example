import { createError } from "../errors/errors.js";
import JwtUtils from "../security/JwtUtils.js";
import accountService from "../service/accountService.js";

const BEARER = "Bearer ";
const BASIC = "Basic ";

export function authenticate() {
    return async (req, res, next) => {
        const authHeader = req.header("Authorization");
        if (authHeader) {
            if (authHeader.startsWith(BEARER)) {
                jwtAuthentication(req, authHeader);
            } else if (authHeader.startsWith(BASIC)) {
                await basicAuthentication(req, authHeader);
            }
        }
        next();
    };
}

function jwtAuthentication(req, authHeader) {
    const token = authHeader.substring(BEARER.length);
    try {
        const payload = JwtUtils.verifyJwt(token);
        req.user = payload.sub;
        req.role = payload.role;
        req.authType = "jwt";
    } catch (error) { 
    }
}

async function basicAuthentication(req, authHeader) {
    const userNamePasswordBase64 = authHeader.substring(BASIC.length);
    const userNamePassword = Buffer.from(userNamePasswordBase64, "base64").toString("utf-8");
    const [username, password] = userNamePassword.split(":");
    try {
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            req.role = "";
        } else {
            const serviceAccount = accountService.getAccount(username);
            await accountService.checkLogin(serviceAccount, password);
            req.role = serviceAccount.role;
        }
        req.user = username;
        req.authType = "basic";
    } catch (error) {
    }
}

export function checkAuthentication(paths) {
    return (req, res, next) => {
        const {authentication, authorization} = paths[req.method];
        if (!authorization) {
            throw createError(500, "security configuration not provided");
        }
        if (authentication(req)) {
            if (req.authType !== authentication(req)) {
                throw createError(401, "no required authentication");
            }
        }
        if (!authorization(req)) {
            throw createError(403, "action not permited");
        }
        next();
    }

}