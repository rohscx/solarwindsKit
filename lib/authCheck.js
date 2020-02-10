const request = require('./request.js');
const basicAuth = require('./basicAuth.js')
module.exports = function (data,callBack) {
    return new Promise(async (resolve,reject) => {
        
        if (!data) reject({rejected:["authCheck.js","bad data"," no Data"]});
        const {userDomain,userName,userPassword,serverUrl} = data;
        const domainName = `${userDomain}\\${userName}`;
        const userBasicAuth = await basicAuth(domainName,userPassword);
        const options = { 
            method: 'POST',
            url: `${serverUrl}/Invoke/Orion.Environment/GetSqlServerIpAddresses`,
            headers: { 
                'cache-control': 'no-cache',
                Connection: 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                Accept: '*/*',
                'Content-Type': 'application/json',
                Authorization: userBasicAuth 
            },
            body: {},
            json:true, 
        };
        const routes = ['/Invoke/Orion.Environment/GetSqlServerIpAddresses'];
        request(options).then(({statusCode,body}) => statusCode !== 200 ?  reject({statusCode,options}):  resolve({authData:{userBasicAuth,serverUrl},metaData:{serverIp: body,routes}}));
    })
}