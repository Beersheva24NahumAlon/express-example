import express from "express";
import { valitator } from "../middleware/validation.js";
import { schemaAccount, schemaGetAccount } from "../validation/schemas.js";
import accountService from "../service/AccountServiceMongo.js";
import { checkAuthentication } from "../middleware/auth.js";
import accountsPaths from "../paths/accountsPaths.js";
import asyncHandler from "express-async-handler";

const accountsRouterAsync = express.Router();
accountsRouterAsync.use(checkAuthentication(accountsPaths));

accountsRouterAsync.post("/admin", valitator(schemaAccount), asyncHandler(async (req, res) => {
    await accountService.addAdminAccount(req.body);
    res.status(201).send("admin account added");
}));
accountsRouterAsync.post("/user", valitator(schemaAccount), asyncHandler(async (req, res) => {
    await accountService.addUserAccount(req.body);
    res.status(201).send("user account added");
}));
accountsRouterAsync.put("/", valitator(schemaAccount), asyncHandler(async (req, res) => {
    await accountService.updateAccount(req.body);
    res.status(200).send("account updated");
}));
accountsRouterAsync.get("/", valitator(schemaGetAccount), asyncHandler(async (req, res) => {
    const account = await accountService.getAccount(req.body.username);
    res.status(200).send(account);
}));
accountsRouterAsync.post("/login", asyncHandler(async (req, res) => {
    const token = await accountService.login(req.body);
    res.status(200).send(token);
}));
accountsRouterAsync.delete("/", valitator(schemaGetAccount), asyncHandler(async (req, res) => {
    await accountService.removeAccount(req.body.username);
    res.status(200).send("account deleted");
}));
export default accountsRouterAsync;