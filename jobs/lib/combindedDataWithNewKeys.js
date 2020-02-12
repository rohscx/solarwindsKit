module.exports = function (data, array) {
    return data.map(({caption, ip, description, serialNumber, manufacturer, model, association}) => {
        const nonProductionIpArray = array;
        const isTrue = nonProductionIpArray.includes(ip.trim());
        if (isTrue) {
            return {
                caption,
                ip,
                description,
                serialNumber,
                manufacturer,
                model,
                association,
                production: false
            }
        } else {
            return {
                caption,
                ip,
                description,
                serialNumber,
                manufacturer,
                model,
                association,
                production: true
            }
        }
    
    });
}