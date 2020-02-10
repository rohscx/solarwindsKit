const {writeFile, hashFunction,hashTable} = require('nodeutilz');
const { Parser } = require('json2csv');
const acaByIp = require('./lib/acaByIp.js');
const deviceData = require('../export/json/inventory_Vendor.json');
const veloCloudData = require('../import/edgeNetworks.json');
const manufacturerData = require('../import/manufacturer.json');
const accessPoints = require('../import/accessPoints.json'); 
const filePath1 = (data,type="json") => `./export/${type}/inventory_${data}.${type}`;
const getOctents = (data,octetLimit=2) => {
    const  split = data.split('.');
    const filtered = split.filter((f,i) => i+1 <= octetLimit);
    return filtered.join('.').trim();
};
const fileEncoding = 'utf8';


const hashableMe  = new hashTable(hashFunction,50);

const Manufacturers = manufacturerData.map(({key,value}) => hashableMe.add(key,value));
const cleanedVeloData = veloCloudData.map(({name,serial,modelNumber,mgmt}) => {
    const isCidr = mgmt;
    if (isCidr) {
        return {name,serial,modelNumber,mgmt};
    } else {
        const newVeloData = {name,serial,modelNumber,mgmt:{cidrIp:"0.0.0.0"}}
        return newVeloData;
    }

})

 cleanedVeloData//?

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
const VceObjectFormating = cleanedVeloData.map(({name,serial,modelNumber,mgmt:{cidrIp}}) => {
    const manufacturerDescription = "Velocloud by VMware";
    const manufacturerName = "Velocloud";
    const object = {
        caption:name,
        ip:cidrIp,
        description:manufacturerDescription,
        serialNumber:serial,
        manufacturer:manufacturerName,
        model:modelNumber,
        association:acaByIp(getOctents(cidrIp))
    };
    return object;  
});


const accessPointsObjectFormating = accessPoints.map((d) => {
    const {serialNumber,name,model,controllerName,ipAddress} = d["accessPointsDTO"];
    const object = {
        caption: name,
        ip: ipAddress,
        description: controllerName,
        serialNumber,
        manufacturer: "Cisco Systems Inc", 
        model, 
        association: acaByIp(getOctents(ipAddress))}
    return object;
})



combindedData = [...deviceDataAca,...VceObjectFormating,...accessPointsObjectFormating]//?

manufacturerCombindedData = combindedData.map(({caption, ip, description, serialNumber, manufacturer, model, association}) => {
    const isEmpty =  ((manufacturer === null || manufacturer.length <= 0) && description !== null);


    if (isEmpty) {
        const shortName = description.toLowerCase().split('').splice(0,3).join("");
        const lookup = hashableMe.lookup(shortName);
        return {caption, ip, description, serialNumber, manufacturer:lookup, model, association};
    } else {
        return {caption, ip, description, serialNumber, manufacturer, model, association};
    }

});

const filteredData = manufacturerCombindedData.filter(({caption, ip, description, serialNumber, manufacturer, model, association}) => ip.trim() !== "0.0.0.0");

const objectKeys = ["caption", "ip", "description", "serialNumber", "manufacturer", "model", "association"];
const opts = { fields: objectKeys, unwind:"networks"}

const myparseData = new Parser(opts) 

const csv = myparseData.parse(filteredData) 
//console.log(csv)//?
writeFile(filePath1("acaData","csv"),csv,'utf8')