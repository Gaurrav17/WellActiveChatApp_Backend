const errorMiddleware = (err, req, res, next) => {
   err.message ||= "Internal Server Error";
   err.statusCode ||=  500;
  
  
   if(err.code === 11000){

    const error = Object.keys(err.keyPattern).join(",");
     
    err.message = `Duplicate field ${error}`
    err.statusCode = 400     
   }

//    console.log(err);

   if(err.name === "castError"){
    const errorPath = err.path;
    err.message = `Invalid Format of ${errorPath}`;
    err.statusCode = 400;
   }

   if(err.statusCode === 500){
    const errorPath = err.path;
    err.message = `Invalid Format of ${errorPath}`;
    err.statusCode = 400;
   }
  

   return res.status(err.statusCode).json({
          success: false,
          message: process.env.NODE_ENV === "DEVELOPEMENT" ? err.message  : err.message,
          //message:     
   });
};     


const TryCatch = (passedFunc) => async(req, res, next) =>{
    try {
        await passedFunc(req, res, next)
    } catch (error) {
        console.log("in try Catch block of catck block error", error)
        next(error);
    } 
}

export {errorMiddleware, TryCatch};