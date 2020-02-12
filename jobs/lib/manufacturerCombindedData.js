module.exports = function (data, hashTable) {
    return data.map(({caption, ip, description, serialNumber, manufacturer, model, association}) => {
        const isEmpty =  ((manufacturer === null || manufacturer.length <= 0) && description !== null);
        if (isEmpty) {
            const shortName = description.toLowerCase().split('').splice(0,3).join("");
            const lookup = hashTable.lookup(shortName);
            return {caption, ip, description, serialNumber, manufacturer:lookup, model, association};
        } else {
            return {caption, ip, description, serialNumber, manufacturer, model, association};
        }
    
    });
}