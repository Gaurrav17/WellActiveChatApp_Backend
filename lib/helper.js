//import { userSocketIds } from "../App.js";


export const getOtherMember = (members, userId) =>
 members.find((member) => member._id.toString()!==userId.toString());


//  export const getSockets = (users = []) => {
//     const sockets = users.map((user) => userSocketIds.get(user._id.toString())).filter(socket => socket); // Filter out undefined values
//     return sockets;
// };

export const getBase64 = (file) => 
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
