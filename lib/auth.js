const dotenv = require('dotenv').config();

module.exports = function (){
    return new Promise((resolve, reject) => {
        const serverAuth = {
            userName: String.raw`${process.env.SOLARWINDS_AUTH_USERNAME}`,
            userPassword: String.raw`${process.env.SOLARWINDS_AUTH_PASSWORD}`
        };
        const serverUrl = process.env.SOLARWINDS_URL;
        if (serverAuth.length == 0 | serverUrl.length == 0) reject({rejected:["auth.js","bad password Key","process.env.SOLARWINDS_AUTH | process.env.SOLARWINDS_URL"]})
        //const authOptions = {serverAuth,serverUrl};
        //const serverAuthJson = JSON.parse(serverAuth);
        const {userName,userPassword} = serverAuth;
      
        resolve({userName,userPassword,serverUrl})
    });
}