const auth = require('./lib/auth.js');
const authCheck = require('./lib/authCheck.js');
const devicesQueryVendor = require('./lib/devicesQueryVendor.js');
const devicesQueryMachineType = require('./lib/devicesQueryMachineType.js');
const {objectKeyFilter, writeFile, flattenArray,readFile} = require('nodeutilz');
const { Parser } = require('json2csv');

const filePath1 = (data) => `./export/json/inventory_${data}.json`;
const fileEncoding = 'utf8';
const fileWriterJson1 = (data) => {
    return writeFile(filePath1('MachineType'),JSON.stringify(data,null,'\t'),fileEncoding)
};
const fileWriterJson2 = (data) => {
    return writeFile(filePath1('Vendor'),JSON.stringify(data,null,'\t'),fileEncoding)
};
// Validates that the API is reachable and returning good data about the target enterprise
const accountStatusCheck = false;

if (accountStatusCheck) {
    auth()
        .then(authCheck)
        .then(console.log)
        .catch(console.log)
} else {
    auth()
        .then(authCheck)
        .then(devicesQueryMachineType)
        .then(fileWriterJson1)
        .then(console.log)
        .catch(console.log)
    auth()
        .then(authCheck)
        .then(devicesQueryVendor)
        .then(fileWriterJson2)
        .then(console.log)
        .catch(console.log)

}