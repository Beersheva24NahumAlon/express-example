import express from "express";
import { valitator } from "../middleware/validation.js";
import { schemaAccount, schemaGetAccount } from "../validation/schemas.js";
import accountService from "../service/accountService.js";
import { checkAuthentication } from "../middleware/auth.js";
import accountsPaths from "../paths/accountsPaths.js";

const accountsRouter = express.Router();
accountsRouter.use(checkAuthentication(accountsPaths));

accountsRouter.post("/admin", valitator(schemaAccount), (req, res) => {
    accountService.addAdminAccount(req.body);
    res.status(201).send("admin account added");
});
accountsRouter.post("/user", valitator(schemaAccount), (req, res) => {
    accountService.addUserAccount(req.body);
    res.status(201).send("user account added");
});
accountsRouter.put("/", valitator(schemaAccount), (req, res) => {
    accountService.updateAccount(req.body);
    res.status(200).send("account updated");
});
accountsRouter.get("/", valitator(schemaGetAccount), (req, res) => {
    const account = accountService.getAccount(req.body.username);
    res.status(200).send(account);
});
accountsRouter.post("/login", (req, res) => {
    const token = accountService.login(req.body);
    res.status(200).send(token);
});
accountsRouter.delete("/", valitator(schemaGetAccount), (req, res) => {
    accountService.removeAccount(req.body.username);
    res.status(200).send("account deleted");
});
export default accountsRouter;