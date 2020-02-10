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
        const machineTypes = [ "Catalyst 356048 PS", "Catalyst 3560X 48 PoE", "Cisco 1841", "Cisco 4331 ISR", "Cisco 4431 ISR", "Cisco AirCt2504K9", "Cisco ASA 5508-X", "Cisco ASA 5555-X", "Cisco ASR1002-X", "Cisco Catalyst 2960C-8PC-L", "Cisco Catalyst 2960CX-8PC-L Switch", "Cisco Catalyst 29xxStack", "Cisco Catalyst 3560-G24TS", "Cisco Catalyst 36xx stack-able ethernet switch", "Cisco Catalyst 38xx stack", "Cisco Catalyst 9300 Series Switch", "Cisco ISR4331", "Cisco L-AIR-CTVM-5-K9", "Cisco n9000-dk9", "Cisco Nexus 5548", "Cisco Nexus 5596 UP", "Cisco Nexus 5672UP", "Cisco Nexus 5672UP Switch", "Cisco UCS", "Cisco UCS 6248UP 48-Port Fabric Interconnect", "Cisco WS-C4506", "Cisco WS-C4507", "masterSwitch rPDU2", "masterSwitchrPDU", "Meraki Networks, Inc.", "net-snmp - Linux", "Nexus 7004", "Nexus 93180YC-EX", "OpenGear", "Opengear ACM550x", "Opengear IM72xx", "OpenGear IM42xx", "PA-3020", "PA-5200", "Palo Alto Networks PA-200 series firewall", "Palo Alto PA-220", "SA45000", "SMARTUPS2", "WLC 5520"];
        const optionsGenerator = (serverUrl,userBasicAuth,machineTypes) => {
           return  machineTypes.map((machineType) => {
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
                        query:"SELECT OrionNodes.Caption, OrionNodes.IP_Address, NcmEntityPhysical.EntityDescription, NcmEntityPhysical.Serial, NcmEntityPhysical.Manufacturer, NcmEntityPhysical.Model FROM NCM.NodeProperties AS NcmNodeProperties INNER JOIN Orion.Nodes AS OrionNodes ON NcmNodeProperties.CoreNodeID=OrionNodes.NodeID LEFT JOIN NCM.EntityPhysical AS NcmEntityPhysical ON NcmEntityPhysical.NodeID=NcmNodeProperties.NodeID AND NcmEntityPhysical.EntityClass=3 WHERE OrionNodes.MachineType in @machineType",
                            parameters:{
                                "machineType":[machineType]
                        }
                    },
                    json:true, 
                };
                return options
            })
        }
        const options = optionsGenerator(serverUrl,userBasicAuth,machineTypes);
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