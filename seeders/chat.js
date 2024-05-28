import {faker, simpleFaker} from "@faker-js/faker";
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";


const createSingleChats = async(numChats)  => {
    try {
        const users = await User.find().select("_id");
  
        const chatsPromise = [];
  
        for(let i = 0; i < users.length; i++) {
            for(let j = 0; j < users.length; j++) {
                chatsPromise.push(
                    Chat.create({
                        name: faker.lorem.words(),
                        members: [users[i], users[j]]
                    })
                );
            }      
        }
  
        // Wait for all chat creation promises to resolve
        await Promise.all(chatsPromise);
        console.log("Chats Created Succesfully");
        process.exit();
        // Optionally, return something if needed
        // return "Chats created successfully";
    } catch (error) {
        // Handle error
        console.error("Error creating chats:");
       // throw error;
        process.exit(1);
    }
  }
  
  
  const createGroupChats = async () => {
    try {
        const users = await User.find().select("_id");
        const numChats = 10;
        const chatsPromise = [];
  
        for (let i = 0; i < numChats; i++) {
            const members = [];
            const numParticipants = Math.floor(Math.random() * (users.length - 2)) + 3; // At least 3 participants per chat
  
            for (let j = 0; j < numParticipants; j++) {
                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];
                if (!members.includes(randomUser._id)) {
                    members.push(randomUser._id);
                }
            }
  
            const chat = await Chat.create({
                groupChat: true,
                name: faker.lorem.words(1),
                members,
                creator: members[0]
            });
  
            chatsPromise.push(chat);
        }
  
        await Promise.all(chatsPromise);
        console.log("Group chats created successfully");
  
        process.exit();
    } catch (error) {
        //console.error("Error creating group chats:", error);
        // Optionally, throw error or handle it accordingly
  
        console.error("Error creating chats:");
       // throw error;
        process.exit(1);
    }
  }
  
  
  
  
  const createMessages = async (numMessages) => {
    try {
        const users = await User.find().select("_id");
        const chats = await Chat.find().select("_id");
  
        const messagesPromises = [];
  
        for (let i = 0; i < numMessages; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomChat = chats[Math.floor(Math.random() * chats.length)];
            messagesPromises.push(
                Message.create({
                    chat: randomChat,
                    sender: randomUser,
                    content: faker.lorem.sentence(),
                })
            );
        }
  
        await Promise.all(messagesPromises);
        
        console.log("Messages created successfully");
  
        process.exit(1);
        // Indicate success
    } catch (error) {
        console.error("Error creating messages:", error);
        process.exit(1);
   // Indicate failure
    }
  }
  
  const createMessagesInaChat = async (chatId, numMessages) => {
    try {
        const users = await User.find().select("_id");
        //const chats = await Chat.find().select("_id");
  
        const messagesPromises = [];
  
        for (let i = 0; i < numMessages; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            // const randomChat = chats[Math.floor(Math.random() * chats.length)];
            messagesPromises.push(
                Message.create({
                    chat: chatId,
                    sender: randomUser,
                    content: faker.lorem.sentence(),
                })
            );
        }
  
        await Promise.all(messagesPromises);
        console.log("Messages created successfully");
        process.exit();
        // Indicate success
    } catch (error) {
        console.error("Error creating messages:", error);
        process.exit(1);
        // Indicate failure
    }
  }
  
  
  export {createSingleChats, createGroupChats, createMessages, createMessagesInaChat }