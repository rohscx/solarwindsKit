module.exports = function (data, acaByIp, getOctents) {
    return data.map(({name,serial,modelNumber,mgmt:{cidrIp}}) => {
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
}