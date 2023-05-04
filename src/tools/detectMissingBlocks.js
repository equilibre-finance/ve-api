'use strict';
const {_} = require('lodash');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});
const Web3 = require('web3');
const web3 = new Web3(process.env.RPC);


async function main() {
    const data0 = readJsonFileData('../data/allData.json');
    const data1 = readJsonFileData('../data1/allData.json');
    const blocks0 = loadArrayItemsFromProperty(data0);
    const blocks1 = loadArrayItemsFromProperty(data1);
    const missing0 = findMissingItemsInArrays(blocks0, blocks1);
    const missing1 = findMissingItemsInArrays(blocks1, blocks0);
    console.log(`missing0: ${missing0.length}`, missing0.join(','));
    console.log(`missing1: ${missing1.length}`, missing1.join(','));
}

function findMissingItemsInArrays(array1, array2){
    const data = _.difference(array1, array2);
    return _.uniq(data);
}

function loadArrayItemsFromProperty(array){
    return array.map( item => item.block );
}
function readJsonFileData( file ){
    const fs = require('fs');
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}

main();