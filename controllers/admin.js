import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js"
import { ErrorHandler } from "../utils/utility.js";
import  jwt  from "jsonwebtoken";
import { cookieOption } from "../utils/features.js";



const adminLogin = TryCatch(async(req, res, next) => {
     
    
         const { secretKey } = req.body;

         const adminSecretKey = process.env.ADMIN_SECRET_KEY || "hellojinamste";

         const isMAtched = secretKey === adminSecretKey;

         if(!isMAtched)
         return next(new ErrorHandler("Invalid Admin Key", 401));
        
         const token = jwt.sign(secretKey, process.env.JWT_SECRET);

         return res.status(200).cookie("WellBoom-admin-token", token, {...cookieOption, maxAge: 1000*60*15})
         .json({
            sucess: true,
            message: "Authenticated SuccesFully, WelcomeBoss",
         });

})

const adminLogout = TryCatch(async(req, res, next) => {
     

    return res.status(200).cookie("WellBoom-admin-token"," ", {...cookieOption, maxAge: 0})
    .json({
       sucess: true,
       message: "logout SuccesFully",
    });

})






const allUsers = TryCatch(async(req, res) => {

   const users = await User.find({});

   const transformedUsers = await Promise.all(users.map(async({name, username, avatar, _id}) =>{

    const [groups, friends] = await Promise.all([
        Chat.countDocuments({groupChat: true, members: _id}),
        Chat.countDocuments({groupChat: false, members: _id}),
    ]);
   

    return{
      name,
      username,
      avatar: avatar.url,
      _id,
      groups,
      friends,
   }



   }));

 

   return res.status(200).json({
          status: "sucess",
          users:  transformedUsers,
     
   })


})

const allChats = TryCatch(async (req, res) => {

  const chats = await Chat.find({}).populate("members", "name avatar").populate("creator", "name avatar");
  
  const transformedChats = await Promise.all(chats.map(async({members, _id, groupChat, name, creator}) =>{

   const totalMessages = await Message.countDocuments({chat: _id});
   

    return{
      name,
      _id,
      groupChat,
      avatar: members.slice(0, 3).map((member) => member.avatar.url),
      members: members.map((_id, name, avatar) => {
        return {
            _id,
            name,
            avatar: avatar.url,
        }
      } ),
      creator: {
     name: creator?.name || "None", 
     avatar: creator?.avatar.url || "",
      },
      totalMembrs: members.length,
      totalMessages,
   }

   }));

    return res.status(200).json({
    status: "sucess",
    chats:  transformedChats,

})

})


const allMessages = TryCatch(async(req, res) => {

  const messages = await Message.find({})
                   .populate("sender", "name avatar")
                   .populate("chat", "groupChat");

      const transformedMessages = messages.map(({content, attachments, _id,
        createdAt, 
        chat, sender}) => ({

         _id,
         content,
         createdAt,
         attachments,
         chat: chat._id,
         groupChat: chat.groupChat,
         sender: {
         _id: sender._id,
         name: sender.name,
         avatar: sender.avatar.url,
         }

        }))
           
          return res.status(200).json({
                sucess: true,
                messages: transformedMessages,
          })         

})


const getDashBoardStats = TryCatch(async(req, res) => {

  const [groupsCount, usersCount, messagesCount, totslChatsCount] = 
  
  await Promise.all([Chat.countDocuments({groupChat: true}),

                      User.countDocuments(),
                      Message.countDocuments(),
                      Chat.countDocuments()
])

const today = new Date();

const last7Days = new Date();
last7Days.setDate(last7Days.getDate() - 7);

const last7DaysMessages = await Message.find({
    createdAt:{ $gte: last7Days,
      $lte: today,}
}).select("createdAt");

const messages = new Array(7).fill(0);

const dayInMiliSeconds = 1000*60*60*24;
  
  last7DaysMessages.forEach((message) => {

    const indexApprox = (today.getTime() - message.createdAt.getTime())/dayInMiliSeconds;
    const index = Math.floor(indexApprox);

    messages[6-index]++;
    
  });


    const stats = {
        groupsCount,
        usersCount,
        messagesCount,
        totslChatsCount,
        messagesChart: messages,
    }

    return res.status(200).json({
                  sucess: true,
                   messages: stats,
            })         
  
  })

  const getAdminData = TryCatch(async(req, res, next) => {
  
    return res.status(200).json({
        admin: true,
    })
    


  })

export { allUsers, allChats, allMessages, getDashBoardStats, adminLogin, adminLogout, getAdminData };
