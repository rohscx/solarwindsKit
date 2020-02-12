module.exports = function (data, acaByIp, getOctents) {
    return data.map((d) => {
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
    });
}