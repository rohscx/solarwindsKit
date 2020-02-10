const request = require('./request.js');
const basicAuth = require('./basicAuth.js');
const Bottleneck =  require("bottleneck");
const cliProgress = require('cli-progress');
const _colors = require('colors');
const {objectKeyFilter, writeFile, flattenArray,readFile} = require('nodeutilz');

module.exports = function (data,callBack) {
    const limiter = new Bottleneck({
        maxConcurrent: 2,
        minTime: 600
      });
    const bar1 = new cliProgress.SingleBar({
    format: 'MAC EPiG Update Progress |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});
    return new Promise(async (resolve,reject) => {
        
        if (!data) reject({rejected:["authCheck.js","bad data"," no Data"]});
        const {authData:{userBasicAuth,serverUrl},metaData:{routes}} = data;
        const vendors = ["Cisco","OpenGear","American Power Conversion Corp.","Meraki Networks, Inc.","Palo Alto Networks"];
        const optionsGenerator = (serverUrl,userBasicAuth,vendor) => {
           return  vendor.map((vendor) => {
                const options = { 
                    method: 'POST',
                    url: `${serverUrl}/Query`,
                    headers: { 
                        'cache-control': 'no-cache',
                        Connection: 'keep-alive',
        
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Cache-Control': 'no-cache',
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: userBasicAuth 
                    },
                    body: {
                        query:"SELECT OrionNodes.Caption, OrionNodes.IP_Address, NcmEntityPhysical.EntityDescription, NcmEntityPhysical.Serial, NcmEntityPhysical.Manufacturer, NcmEntityPhysical.Model FROM NCM.NodeProperties AS NcmNodeProperties INNER JOIN Orion.Nodes AS OrionNodes ON NcmNodeProperties.CoreNodeID=OrionNodes.NodeID LEFT JOIN NCM.EntityPhysical AS NcmEntityPhysical ON NcmEntityPhysical.NodeID=NcmNodeProperties.NodeID AND NcmEntityPhysical.EntityClass=3 WHERE OrionNodes.Vendor in @vendor",
                            parameters:{
                                vendor:[vendor]
                        }
                    },
                    json:true, 
                };
                return options
            })
        }
        const options = optionsGenerator(serverUrl,userBasicAuth,vendors);
        routes.push("/Query");
        const payloadLength = options.length;
        const newPayload = Promise.all(options.map( (option,i) => {
            bar1.start(payloadLength, 0, {
                speed: "N/A"
            });
            return  limiter.schedule(() => {
                bar1.increment(); 
                if (payloadLength === i+1) bar1.stop();
                return request(option)
                .catch(console.error)
            });
        })).then(flattenArray).then((t) => t.map(({statusCode,body}) => body.results)).then(flattenArray);
        resolve(newPayload)
        //request(options).then(({statusCode,body}) => statusCode !== 200 ?  reject({statusCode,options}):  resolve({response:body,...data})).catch(console.log);
    })
}