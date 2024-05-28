
const corsOption = {
    origin: 'http://localhost:5173', 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials:true,            
    optionSuccessStatus:200
}


const WELLBOOM_TOKEN = "wellBoom-token";
 
export { corsOption, WELLBOOM_TOKEN }