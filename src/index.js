'use strict';
const express = require('express')
const Web3 = require('web3');
require('dotenv').config({path: '.env'});
const web3 = new Web3(process.env.RPC);
const fs = require('fs');
const { md } = import('markdown-to-html-cli');

process.on('uncaughtException', function (err) {
    console.error('[uncaughtException]', err);
    // process.exit(0);
});
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;


const votingEscrowContract = '0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A';
const bribeContract = '0xc401adf58F18AF7fD1bf88d5a29a203d3B3783B2';
const minAmount = 165;

let info = [], totalVARA = 0, totalVE = 0;
let allData = [], veLockersJSON = [];
const abi = JSON.parse(fs.readFileSync("./voting-escrow-abi.js", "utf8"));
const votingEscrow = new web3.eth.Contract(abi, votingEscrowContract);

const bribe_abi = JSON.parse(fs.readFileSync('./bribe-abi.js'));
const bribe = new web3.eth.Contract(bribe_abi, bribeContract);

const YEAR = 365;
const DAY = 86400;
const FACTOR = 0.25 / YEAR;

function computeVeVARA(amount, locktime, ts) {
    const days = parseInt((locktime - ts) / DAY);
    return parseFloat(FACTOR * days * amount);
}

async function onEventData( events ){
    for (let j = 0; j < events.length; j++) {
        const e = events[j];
        if (!e.event) continue;
        if (e.event !== 'Deposit') continue;
        const u = e.returnValues;
        let amount = u.value;
        let locktime = u.locktime;
        if( u.deposit_type == 2 ) {
            // await new Promise(resolve => setTimeout(resolve, 1000));
            const LockedBalance = await votingEscrow.methods.locked(u.tokenId).call();
            locktime = LockedBalance.end;
        }
        amount = parseFloat(web3.utils.fromWei(amount));
        if( amount === 0 ) continue;
        const ve = computeVeVARA(amount, parseInt(locktime), parseInt(u.ts));
        if (ve === 0) continue;
        const days = parseInt((locktime - u.ts) / DAY);
        if (days === 0) continue;
        const date = new Date(u.ts*1000).toISOString();
        const line = `|${u.provider}|${parseFloat(amount).toFixed(2)}|${parseFloat(ve).toFixed(2)}|${days}|${date}|`;
        if (u.ts > config.epochEnd ) {
            console.log(` STOP: locktime=${locktime} epochEnd=${config.epochEnd}`);
            endProcessing = true;
            break;
        }
        totalVARA += amount;
        totalVE += ve;
        console.log(line);
        info.push(line);
        allData.push({address: u.provider, amount: amount, ve: ve, days: days, date: date});
    }
}

let endProcessing = false;
let config, home;
async function scanBlockchain() {
    let size = config.debug ? 1 : 1000

    info.push(`|Address|Vara|veVara|Days|Date|`);
    info.push(`|:---|---:|---:|---:|---:|`);

    for (let i = config.startBlockNumber; i < config.endBlockNumber; i += size) {
        if( endProcessing ) break;
        const args = {fromBlock: i, toBlock: i + size};
        try {
            const r = await votingEscrow.getPastEvents(args);
            await onEventData(r);
        } catch (e) {
            console.log(e.toString());
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const TOTAL = `# Totals:\n\n- VARA ${totalVARA}\n- veVARA ${totalVE}\n\n`;
    console.log(TOTAL);
    info = prepend(TOTAL, info);
    home = md( {markdown: info.join('\n')} );
    veLockersJSON = allData;
}

async function getBlocksFromLastEpoch(block) {
    const latest = await web3.eth.getBlock("latest");
    const epochStart = parseInt(latest.timestamp);
    const epochEnd = parseInt((await bribe.methods.getEpochStart(latest.timestamp).call()).toString());
    const blocksBehind = parseInt((latest.timestamp - epochEnd) / 6.4);
    const startBlockNumber = latest.number - blocksBehind;
    const endBlockNumber = latest.number;
    config = {
        epochStart: epochStart,
        epochEnd: epochEnd,
        startBlockNumber: startBlockNumber,
        endBlockNumber: endBlockNumber
    };
    if( block ){
        config.debug = true;
        config.startBlockNumber = block;
        config.endBlockNumber = block+1;
    }
}

function prepend(value, array) {
    let newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}

async function exec(){
    const block = 0;
    await getBlocksFromLastEpoch(block);
    try {
        await scanBlockchain();
    } catch (e) {
        console.log(`Error running the chain scan: ${e.toString()}`);
    }
}

async function main() {
    const app = express()
    const port = process.env.HTTP_PORT

    app.get('/', (req, res) => {
        res.send(home)
    })

    app.get('/api/v1/weekly-ve-lockers', (req, res) => {
        res.json( veLockersJSON );
    })

    app.listen(port, () => {
        console.log(`- HTTP ${port}`)
    })

    console.log(`- RPC: ${process.env.RPC}`);
    await exec();
    setInterval(exec, 60 * 60 * 1000 );
}

main();
