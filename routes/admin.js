import express from "express"
import { singleAvatar } from "../middlewares/multer.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashBoardStats } from "../controllers/admin.js";
import { LoginAdminValidator, validateHandler } from "../lib/validators.js";

const app = express.Router();

app.get("/");
app.post("/verify", LoginAdminValidator(), validateHandler, adminLogin);
app.get("/logout", adminLogout);

app.use(isAdmin);

app.get("/", getAdminData);

app.get("/users", allUsers); 
app.get("/chats", allChats);
app.get("/message", allMessages);
app.get("/stats", getDashBoardStats);

export default app;