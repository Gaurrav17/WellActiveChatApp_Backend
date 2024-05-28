import  {ALERT, NEW_ATTACHMENTS, NEW_ATTACHMENTS_ALERT, REFTCH_CHATS}   from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { deleteFilesFromCloudinary, emitEvent } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { Message } from "../models/message.js";


const newGroupChat = TryCatch(async (req, res, next) => {
    const { name, members } = req.body;

  


   

    const allMembers = [...members, req.user]; 
    const creator = req.user; 
   
        await Chat.create({
            name,
            groupChat: true,
            creator,
            members: allMembers,
        });

        
        emitEvent(req, ALERT, allMembers, `Welcome to ${name} Group Chats`);
        emitEvent(req, REFTCH_CHATS, members, `Welcome to ${name} Group Chats`);

        
        return res.status(200).json({
            success: true,
            message: "Group Chat Created",
        });
   
});


const getMyChats = TryCatch(async (req, res, next) => {
   
     const chats = await Chat.find({members: req.user}).populate("members", "name avatar");

     const transformedChats = chats.map(({_id, name, members, groupChat}) =>{
     
     const otherMember = getOtherMember(members, req.user);
     console.log("otherMember:", otherMember);
    
     return{
            _id,
             groupChat,
             avatar: groupChat?members.slice(0, 3).map(({avatar})=>{
             avatar.url
            }):[otherMember?.avatar.url],
            name: groupChat? name: otherMember?.name,
            members: members.reduce((prev, curr)=>{
                if(curr._id.toString() !== req.user.toString()){
                    prev.push(curr._id);
                }
            return prev; 
            }, []),
           }

   })

        return res.status(201).json({
            success: true,
            chats: transformedChats,
        }); 
    
});


const getMyGroups = TryCatch(async(req, res, next) =>{
    
    const chats = await Chat.find({    
        members: req.user,
        groupChat: true,
        creator: req.user,

    }).populate("members", "name avatar");
           
    const groups = chats.map(({members, _id, groupChat, name}) =>({
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map(({avatar})=>
            avatar.url
           ),
      
    }))     

        return res.status(200).json({

          success: true,
          groups,

        });


})


const addMembers = TryCatch(async(req, res, next) =>{
    
       const {chatId, members} = req.body
       const chat = await Chat.findById(chatId);

       if(!chat) return next(new ErrorHandler("Chat Not Found", 404));
  
       if(!chat.groupChat) return next(new ErrorHandler("Chat Not Found", 400));
       
       const k = chat.creator.toString();
       const b = req.user.toString();
      
       console.log("fv", k);
       console.log("fv", b);

        if(chat.creator.toString() !== req.user.toString()) {
        return next(new ErrorHandler("You Are not allowed to add members", 403));}

       
        const allNewMembersPromise = members.map((i)  => User.findById(i, "name"));
       
        const allNewMembers = await Promise.all(allNewMembersPromise);
  
        const uniquemembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString())).map((i) => i._id);
      
        chat.members.push(...uniquemembers);
          
        if(chat.members.length>100) return next(new ErrorHandler("Group Members error Reached", 400));

         await chat.save();
       
         const allUserName = allNewMembers.map((i) => i.name).join(",");
           
         emitEvent(req, ALERT, chat.members, `You Have been added to ${allUserName} `);
         emitEvent(req, REFTCH_CHATS, chat.members);

        return res.status(200).json({
          success: true,
          message: "members added Succcesfully",
        });


})

const removeMembers = TryCatch(async(req, res, next) =>{

  const {userId, chatId} = req.body;

  const [chat, usrThtWillremoved] = await Promise.all([
         
        Chat.findById(chatId),
        User.findById(userId, "name"),
  ]);

   if(!chat)
   return next(new ErrorHandler("Chat Not Found", 404));
  
   if(!chat.groupChat) 
   return next(new ErrorHandler("Chat Not Found", 400));

   if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You Are not allowed to remove members", 403));
 

   if(chat.members.length <=3)
   return next(new ErrorHandler("Groups Must Have 3 members", 400));

   chat.members = chat.members.filter((member) => member.toString() !== userId.toString());


   await chat.save();

   emitEvent(req, ALERT, chat.members, ` ${usrThtWillremoved.name} has been removed`);
   emitEvent(req, REFTCH_CHATS, chat.members);


   return res.status(200).json({
     success: true,
     message: "Members Removed Succesfully",
   })

});


const leaveGroup = TryCatch(async(req, res, next) =>{

      const chatId = req.params.id;
  
      //const chat = Chat.findById(chatId);
      const chat = await Chat.findById(chatId);

          
        
    if(!chat)
     return next(new ErrorHandler("Chat Not Found", 404));
    
    if(!chat.groupChat) 
    return next(new ErrorHandler("Chat Not Found", 400));

     const remainingMember = chat.members.filter((member) => member.toString() !== req.user.toString());
  
    if(chat.creator.toString() === req.user.toString()){
       const newCreator =   remainingMember[0];
       chat.creator = newCreator;
    }
     
    if(chat.members.length <=3)
    return next(new ErrorHandler("You cant levae since the member is less", 400));
  
     chat.members = remainingMember;

     const [user] = await Promise.all([User.findById(req.user, "name"), chat.save()]);
    
  
  
     emitEvent(req, ALERT, chat.members, ` ${user.name} has left the chat`);
     emitEvent(req, REFTCH_CHATS, chat.members);
  
  
     return res.status(200).json({
       success: true,
       message: "Members Left The Chat",
     })
  
  });

const sendAttachment = TryCatch( async(req, res, next) =>{

   
   const {chatId} = req.body;
   const files = req.files || [];

   if(files.length < 1)
   return next(new ErrorHandler("Please Upload Attachment"), 400);
   
   
   if(files.length > 5)
   return next(new ErrorHandler("File Cant Be More Than 5"), 400);

   

   const [chat, me] = await Promise.all( [Chat.findById(chatId), User.findById(req.user, "name") ]);
   if(!chat)
   return next(new ErrorHandler("Chat Not Found", 404));
   

   

   if(files.length < 1)
   return next(new ErrorHandler("Please provide Attachments", 404));
   

   //Uplopad Files Here;

   
   
   const attachments = [];
   





   const messageForDB = {content: "", attachments, sender: me._id, chat: chatId};

   const messageForRealTime = {...messageForDB, sender:{_id: me._id , name: me.name}};

                              

   const message = await Message.create(messageForDB);

   emitEvent(req, NEW_ATTACHMENTS, chat.allNewMembersPromise,{
    message: messageForRealTime,
    chatId
   });

   emitEvent(req, NEW_ATTACHMENTS_ALERT, chat.members,{
    chatId
   })
   
   
   
    return res.status(200).json({
    success: "true",
    message,

  })

  
  }
  );
  
const getChatDetails = TryCatch(async(req, res, next) => {



   if(req.query.populate === "true"){
    
     const chat = await Chat.findById(req.params.id).populate("members", "name avatar").lean();
     
     if(!chat)
     return next(new ErrorHandler("Chat Not Found", 404));
    
        chat.members = chat.members.map(({_id, name, avatar})=>({
           _id,
           name,
           avatar: avatar.url
        }));

     return res.status(200).json({   
         success: true,
         chat,
     })
   }
   else{
    
    const chat = await Chat.findById(req.params.id);
    if(!chat) 
    return next(new ErrorHandler("Please provide Attachments", 404));
     
    return res.status(200).json({
         success: true,
         chat,
    })
   }
})

const renameGroup = TryCatch(async(req, res, next)=>{

   const chatId = req.params.id;
   const {name} = req.body;

   const chat = await Chat.findById(chatId);

   if(!chat) 
   return next(new ErrorHandler("Please provide Attachments", 404));

   if(!chat.groupChat) 
   return next(new ErrorHandler("This Is Not A Group Chat", 400));
   
   if(chat.creator.toString() !== req.user.toString())
   return next(new ErrorHandler("You Are not allowed to Edit Names", 403));

  chat.name = name;

  await chat.save();

  emitEvent(req, REFTCH_CHATS, chat.members);
 

  return res.status(200).json({
    success: true,
    Message: "Group Named Change Succesfully"
})


})

const deleteChat = TryCatch( async(req, res, next)=>{

    console.log("hello");

    const chatId = req.params.id;
    
    const chat = await Chat.findById(chatId);
 
    if(!chat) 
    return next(new ErrorHandler("No Chats Exist", 404));
 
    if(chat.groupChat && chat.creator.toString() !== req.user.toString()) 
    return next(new ErrorHandler("This Is Not A Group Chat", 403));

    if(!chat.groupChat && !chat.member.includes(req.user.toString())) 
    return next(new ErrorHandler("You are not allowed to delete the Group", 403));


     const messagesWithAttachments = await Message.find({
        chat: chatId,
        attachments: { $exists: true, $ne: []}    
    });

    const public_ids = [];


    messagesWithAttachments.forEach(({attachments}) => {
        attachments.forEach(({public_id}) => {
            public_ids.push(public_id);
        });
    });

   
      await Promise.all([
           //Deletes Files from Cloudinary
           deleteFilesFromCloudinary(public_ids),
           chat.deleteOne(),
           Message.deleteMany({chat: chatId}),
      ])

      //emitEvent(req, REFTCH_CHATS, members);
      
      return res.status(200).json({
        success: true,
        message: "Chat Deleted Succesfully"
    })

});


const getMessages = TryCatch(async(req, res, next)=>{
    
  const chatId = req.params.id;
  const { page = 1} = req.query;

  const resultPerPage = 20;
  const skip = (page-1)*resultPerPage;

  const [messages, totalMessageCount] = await Promise.all([    
         Message.find({chat: chatId})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender", "name")
        .lean(),
        Message.countDocuments({chat: chatId})
  ])

     const totalPages = Math.ceil(totalMessageCount/resultPerPage) || 0;
    
     return res.status(200).json({
        success: true,
        messages,
        totalPages,
    })


})

export { newGroupChat, getMyChats, getMyGroups, 
         addMembers, removeMembers, leaveGroup, sendAttachment,
         getChatDetails, renameGroup, deleteChat, getMessages};
