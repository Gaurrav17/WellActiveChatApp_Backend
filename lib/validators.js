import { body, check, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const registerValidator = () => [
    body("name").notEmpty().withMessage("Please Enter Name"),
    body("username").notEmpty().withMessage("Please Enter UserName"),
    body("bio").notEmpty().withMessage("Please Enter Bio"),
    body("password").notEmpty().withMessage("Please Enter Password"),
    // check("avatar").notEmpty().withMessage("Please Upload Avatar"),
];


const loginValidator = () => [
    body("username").notEmpty().withMessage("Please Enter UserName"),
    body("password").notEmpty().withMessage("Please Enter Password"),
];


const newGroupValidator = () => [
    body("name").notEmpty().withMessage("Please Enter Name"),
    body("members").notEmpty().withMessage("Please Enter Members").isArray({min : 2, max: 100})
    .withMessage("Group Chat Must Have Be 2-100 Members"),
];


const addMemberValidator = () => [
    body("chatId").notEmpty().withMessage("Please Enter Chat ID"),
    body("members").notEmpty().withMessage("Please Enter Members").isArray({min : 1, max: 97})
    .withMessage("Members Must Be 1-97"),
];

const removeMemberValidator = () => [
    body("chatId").notEmpty().withMessage("Please Enter Chat ID"),
    body("userId").notEmpty().withMessage("Please Enter User ID"),
];

const leaveGroupValidator = () => [ 
   param("id").notEmpty().withMessage("Please Enter Chat ID"),
];

const sendAttachmentValidator = () => [ 
    body("chatId").notEmpty().withMessage("Please Enter Chat ID"),
    // check("files").notEmpty().withMessage("Please Upload Attachments").isArray({min : 1, max: 5})
    // .withMessage("Attachments Must Be 1-5"),
 ];

 const getChatDetailsValidator = () => [ 
    param("id").notEmpty().withMessage("Please Enter Chat ID"),
 ];

 const getMessagesValidator = () => [ 
    param("id").notEmpty().withMessage("Please Enter Chat ID"),
 ];

const renameGroupValidator = () => [
    param("id").notEmpty().withMessage("Please Enter Chat ID"),
    body("name").notEmpty().withMessage("Please Enter New Name"),         
 ];

 const sendRequestValidator = () => [
    body("userId").notEmpty().withMessage("Please Enter  UserId"),      
 ];

 const acceptRequestValidator = () => [
    body("requestId").notEmpty().withMessage("Please Enter requestId"),
    body("accept").isBoolean().withMessage("Accept Must Be a Boolean"),      
];



const LoginAdminValidator = () => [  
    body("secretKey").notEmpty().withMessage("Please Enter secretKey"),
]

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);
    const errorMessages = errors.array().map((error) => error.msg).join(" , ");
    //console.log(errorMessages);
    if (errors.isEmpty()) return next();
    else
    return next(new ErrorHandler(errorMessages, 400));
};






export { addMemberValidator, 
    getMessagesValidator, leaveGroupValidator,
     loginValidator, newGroupValidator,
      registerValidator, removeMemberValidator,
       sendAttachmentValidator, validateHandler 
    ,getChatDetailsValidator, renameGroupValidator,
     sendRequestValidator, acceptRequestValidator, LoginAdminValidator};

