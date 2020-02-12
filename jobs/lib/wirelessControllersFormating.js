module.exports = function (data, acaByIp, getOctents) {
    return data.map((d) => {
        const {name,modelNumber,productDescription,serialNumber,type,ipAddress} = d["wlanControllerDetailsDTO"];
        const object = {
            caption: name,
            ip: ipAddress,
            description: type,
            serialNumber,
            manufacturer: "Cisco Systems Inc", 
            model: modelNumber, 
            association: acaByIp(getOctents(ipAddress))}
           
        return object;
    });
}