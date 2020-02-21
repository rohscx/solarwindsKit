const {writeFile, hashFunction,hashTable} = require('nodeutilz');
const { Parser } = require('json2csv');
const acaByIp = require('./lib/acaByIp.js');
const combindedDataWithNewKeys = require('./lib/combindedDataWithNewKeys.js');
const manufacturerCombindedData = require('./lib/manufacturerCombindedData.js');
const wirelessControllersFormating = require('./lib/wirelessControllersFormating.js');
const accessPointsObjectFormating = require('./lib/accessPointsObjectFormating.js');
const vceObjectFormating = require('./lib/vceObjectFormating.js');
const deviceData = require('../export/json/inventory_Vendor.json');
const veloCloudData = require('../import/edgeSerialNumbers.json');
const manufacturerData = require('../import/manufacturer.json');
const wirelessAccessPoints = require('../import/wirelessAccessPoints.json'); 
const wirelessControllers = require('../import/wirelessControllers.json'); 
const nonProductionIpAddresses = require('../import/nonProductionIpAddresses.json'); 


const filePath1 = (data,type="json") => `./export/${type}/networkDeviceInventoryBasic_${data}.${type}`;
const getOctents = (data,octetLimit=2) => {
    const  split = data.split('.');
    const filtered = split.filter((f,i) => i+1 <= octetLimit);
    return filtered.join('.').trim();
};
const fileEncoding = 'utf8';


const hashableMe  = new hashTable(hashFunction,50);

const Manufacturers = manufacturerData.map(({key,value}) => hashableMe.add(key,value));
const cleanedVeloEdges = veloCloudData.map(({name,serial,modelNumber,mgmt}) => {
    const isCidr = mgmt;
    if (isCidr) {
        return {name,serial,modelNumber,mgmt};
    } else {
        const newVeloData = {name,serial,modelNumber,mgmt:{cidrIp:"0.0.0.0"}}
        return newVeloData;
    }

})


// cleanedVeloData.map(({name,serial,modelNumber,mgmt:{cidrIp}}) => hashableMe.add(cidrIp,{name,serial,modelNumber}));
// const identityByIp = deviceData.map(({IP_Address}) => getOctents(IP_Address));
// const deduped = Array.from(new Set(identityByIp));

const deviceDataAca = deviceData.map(({Caption,IP_Address,EntityDescription,Serial,Manufacturer,Model}) => ({
    caption:Caption.toLowerCase(),
    ip:IP_Address,
    description:EntityDescription,
    serialNumber:Serial,
    manufacturer:Manufacturer,
    model:Model,
    association:acaByIp(getOctents(IP_Address))
}));

// const deviceDataVce = deviceDataAca.map(({caption, ip, description, serialNumber, manufacturer, model, association}) => {
//     const lookupResult = hashableMe.lookup(ip);
//     if (lookupResult) {
//         const {name,serial,modelNumber} = lookupResult;
//         const manufacturerName = "Velocloud";
//         const manufacturerDescription = "Velocloud by VMware";
//         const newObj = {caption:name, ip, description:manufacturerDescription, serialNumber:serial, manufacturer:manufacturerName, model:modelNumber, association};
//         return newObj;
//     } else {
//         return {caption, ip, description, serialNumber, manufacturer, model, association};
//     }

// })
const VceObjectData = vceObjectFormating(cleanedVeloEdges, acaByIp, getOctents);

const accessPointsData = accessPointsObjectFormating(wirelessAccessPoints, acaByIp, getOctents);

const wirelessControllersData = wirelessControllersFormating(wirelessControllers, acaByIp, getOctents);

const externalSourceIpv4 = [...wirelessControllersData,...VceObjectData,...accessPointsData].map(({ip}) => ip);

const externalSourceIpv4Filtered = deviceDataAca
    .filter(({ip}) => !externalSourceIpv4.includes(ip)) // Filter device IP addressed imported from external files sources
    
combindedData = [...externalSourceIpv4Filtered,...VceObjectData,...accessPointsData,...wirelessControllersData];

const manufacturerCombinded = manufacturerCombindedData(combindedData, hashableMe);

const manufacturerCombindedFiltered = manufacturerCombinded.filter(({serialNumber}) =>  serialNumber !== null ); // Filter devices without serial numbers

// Filter 0.0.0.0 addresses
//const filteredData = manufacturerCombinded.filter(({caption, ip, description, serialNumber, manufacturer, model, association}) => ip.trim() !== "0.0.0.0");

const nonProd = nonProductionIpAddresses;
const combinded= combindedDataWithNewKeys(manufacturerCombindedFiltered, nonProd);

const objectKeys = ["caption", "ip", "description", "serialNumber", "manufacturer", "model", "association", "production"];
const opts = { fields: objectKeys, unwind:"networks"}

const myparseData = new Parser(opts) 

const csv = myparseData.parse(combinded) 
//console.log(csv)//?
writeFile(filePath1("acaData","csv"),csv,'utf8')