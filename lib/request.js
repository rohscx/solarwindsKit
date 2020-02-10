process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const request = require('request');

module.exports = function(optionsObj) {
  const options = optionsObj;
  return new Promise((resolve,reject) => {
    request(options, function(error, response, body) {
      if (error) reject(error);
      //console.log(body,response);
      resolve(response,body);
    });
  });
};
