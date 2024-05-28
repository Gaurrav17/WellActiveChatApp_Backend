import jwt  from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
//import { WELLBOOM_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";

//import { TryCatch } from "./error.js";



const isAuthenticated = TryCatch((req, res, next)=>{
  const token = req.cookies["wellBoom-token"];
   if(!token) return next(new ErrorHandler("please login to access this route", 401));      
   const decodedData = jwt.verify(token, process.env.JWT_SECRET);  
   req.user = decodedData._id;
   next();
}
)







const isAdmin = (req, res, next)=>{
  const token = req.cookies["WellBoom-admin-token"];
   if(!token) return next(new ErrorHandler("Only Admin Can Acces This Route", 401));
  
   //adminSecretKey
  

   const adminId = jwt.verify(token, process.env.JWT_SECRET);  

   const adminSecretKey = process.env.ADMIN_SECRET_KEY || "hellojinamste";

   const isMAtched = adminId === adminSecretKey;

   if(!isMAtched)
   return next(new ErrorHandler("only Admin can access this route", 401));

    
  
   next();
};


const socketAuthenticator = async (err, socket, next) => {
  try {
   if (err) return next(err);

    const authToken = socket.request.cookies["wellBoom-token"];


    //console.log("your token is", authToken);
     if (!authToken) return next(new ErrorHandler("Please login to access this route", 401));

     const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

     const user = await User.findById(decodedData._id);

    if (!user) return next(new ErrorHandler("Only Admin can access this route", 401));

    socket.user = user;

     return next();

  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};

 
export { isAuthenticated , isAdmin, socketAuthenticator };