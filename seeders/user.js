import {faker, simpleFaker} from "@faker-js/faker";
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";



const createUseer = async (numUsers) => {

  try {
     
    const userPromis = [];
    for(let i = 0; i<numUsers; i++){    
          const tempUser = User.create({
               name: faker.person.fullName(),
               username: faker.internet.userName(),
               bio:   faker.lorem.sentence(10),
               password: "password",
               avatar:{
                  url: faker.image.avatar(),
                  public_id: faker.system.fileName(),
               }
          })
          userPromis.push(tempUser);
   
    }
    await Promise.all(userPromis);

    console.log("users created", numUsers);
    process.exit(1);
  }
   

  catch (error) {
    console.log(error);
    process.exit(1);   
  }

}




export { createUseer}