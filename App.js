import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { errorMiddleware } from "./middlewares/error.js";
import adminRoute from "./routes/admin.js";
import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { Message } from "./models/message.js";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";
import { corsOption } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";
//import { getSockets } from "./lib/helper.js";

//import { createMessagesInaChat } from "./seeders/chat.js";
//import { createUseer } from "./seeders/user.js";

dotenv.config({
    path: "./.env"
});



 
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

const userSocketIds = new Map();




//export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "hellojinamste";

connectDB(mongoURI);
cloudinary.config({    
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, 
})
//createUseer(10);
//createGroupChats(10);
//createSingleChats(10);
//createMessagesInaChat("66265559cb9217fc4bcc31f0", 50)


// const corsOrigin ={
//     origin: 'http://localhost:5173', //or whatever port your frontend is using
//     credentials:true,            
//     optionSuccessStatus:200
// }

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOption});

app.use(express.json());
app.use(cookieParser());

app.use(
    cors(corsOption)
);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute); 
app.use("/api/v1/admin", adminRoute);
 

app.get("/", (req, res) =>{
    res.send("Bhai Ji Namaste");
})

io.use((socket, next) => {
  
    cookieParser()(socket.request, socket.request.res, async(err) => {
         await socketAuthenticator(err, socket, next);
    });

})

io.on("connection", (socket) => {
     const user = socket.user;
     

    userSocketIds.set(user._id.toString(), socket.id);
    //console.log(userSocketIds);
    
   //io.use((socket))

    socket.on(NEW_MESSAGE, async({chatId, members, message}) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
        };

        const messageForDB = {  
            content: message,
            sender: user._id,
            chat: chatId
        }

        console.log("Emmiting", messageForRealTime);
      
        const membersSocket = getSockets(members);

       // console.log("He is member Socket", membersSocket);
  
        io.to(membersSocket).emit(NEW_MESSAGE, {             
            chatId,
            message: messageForRealTime,
        })

        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {             
            chatId,
        })


        try {
            await Message.create(messageForDB);
        } catch (error) {
            console.log(error);
        }
        

       
    })

     socket.on("disconnect", () => {
    // console.log("User Disconnected");
     
     userSocketIds.delete(user._id.toString());

    });

})

app.use(errorMiddleware);
server.listen(port, ()=>{
    console.log(`listening on  ${port}`);
})



const getSockets = (users = []) => {
    console.log("inside this function");
    const sockets = users.map((user) => userSocketIds.get(user.toString())).filter(socket => socket); // Filter out undefined values
    return sockets;
};
//export { userSocketIds }