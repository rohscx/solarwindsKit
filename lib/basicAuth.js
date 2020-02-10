module.exports = function (userName,UserPassword) {
    return new Promise((resolve, reject) => {
        if (userName | UserPassword) reject({data:{},message:"badPassword"});
        auth = 'Basic ' + new Buffer.from(userName + ':' + UserPassword).toString('base64');
        resolve(auth);
    });
}