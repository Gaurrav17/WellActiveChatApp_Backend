import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import {v4 as uuid} from "uuid"
import {v2 as cloudinary} from "cloudinary";
import { getBase64 } from "../lib/helper.js";


const cookieOption = {     
    maxAge: 15*24*60*100,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  };


const connectDB = (uri) =>{

    mongoose.connect(uri, {dbName: "WellBoom"})
    .then((data)=> console.log(`Connected To DB: ${data.connection.host}`))
    .catch((error)=> {
        console.error("Error connecting to the database:", error);
        throw error;
    });
};

      

const sendToken = (res, user, code, message) =>{

    const token = jwt.sign({
        _id: user._id
    }, process.env.JWT_SECRET);

    
   return res.status(code).cookie("wellBoom-token", token, cookieOption).json({
        success: true,
        message,
   });
 };

 const emitEvent = (req, event, user, data) => {

    console.log("Emitting event");
    
 }




 const uploadFilesToCloudinary = async(files = []) => {
   
   const uploadPromises = files.map(((file) => {
          
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            getBase64(file), {
            resource_type: "auto",
            public_id: uuid(),
        } ,(error, result) => {
            resolve(result);
        })
    })
   }))


   try {
      
    const results = await Promise.all(uploadPromises);


    const formattedResults = results.map((result) => ({          
        public_id: result.public_id,
        url: result.secure_url,
    }))

 
    return formattedResults;

   } catch (err) {
    throw new Error("Uploading file to cloudinary", err);
   }

    }





 const deleteFilesFromCloudinary = async(public_ids) => {
 console.log("hello");
 }

export {connectDB,  sendToken, cookieOption, emitEvent,  deleteFilesFromCloudinary, uploadFilesToCloudinary};