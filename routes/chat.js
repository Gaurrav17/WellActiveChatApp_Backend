import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup,  newGroupChat, removeMembers, renameGroup, sendAttachment } from "../controllers/chat.js";
import { AttachmentMulter } from "../middlewares/multer.js";
import { addMemberValidator, getChatDetailsValidator, getMessagesValidator, leaveGroupValidator, newGroupValidator, removeMemberValidator, renameGroupValidator, sendAttachmentValidator, validateHandler } from "../lib/validators.js";

const app = express.Router();




app.use(isAuthenticated);

app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/my", getMyChats);
app.get("/my/groups", getMyGroups);
app.put("/addmembers", addMemberValidator(), validateHandler, addMembers);
app.put("/removemember", removeMemberValidator() , validateHandler, removeMembers);
app.delete("/leave/:id",  leaveGroupValidator(), validateHandler,leaveGroup);


app.post("/message", AttachmentMulter,sendAttachmentValidator(), validateHandler, sendAttachment);


//app.route(":/id").get(getChatDetails).put().delete();

app.get("/messages/:id", getMessagesValidator(), validateHandler, getMessages);

app.route("/:id").get(getChatDetailsValidator(), validateHandler, getChatDetails)
.put(renameGroupValidator(),validateHandler, renameGroup)
.delete(getChatDetailsValidator(), validateHandler, deleteChat);


export default app;           