'use strict';
const moment = require('moment')
const express = require('express')
const Web3 = require('web3');
require('dotenv').config({path: '.env'});
const web3 = new Web3(process.env.RPC);
const fs = require('fs');

process.on('uncaughtException', function (err) {
    console.error('[uncaughtException]', err);
    // process.exit(0);
});
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;


const votingEscrowContract = '0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A';
const bribeContract = '0xc401adf58F18AF7fD1bf88d5a29a203d3B3783B2';

let info = [], totalVARA = 0, totalVE = 0;
let allData = [];
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
        const tr = `<tr><td>${u.provider}</td><td>${parseFloat(amount).toFixed(2)}</td><td>${parseFloat(ve).toFixed(2)}</td><td>${days}</td><td>${date}</td></tr>`;
        if (u.ts < config.epochStart ) {
            console.log(` IGNORE: ts=${u.ts} < epochStart=${config.epochStart}`);
            break;
        }
        totalVARA += amount;
        totalVE += ve;
        console.log(line);
        info.push(tr);
        allData.push({address: u.provider, amount: amount, ve: ve, days: days, date: date});
    }
}

let endProcessing = false, running = false;
let config, home;
async function scanBlockchain() {
    if( running ){
        console.log(`scanBlockchain: already running, waiting next interaction...`);
        return;
    }
    running = true;
    let size =  1000
    const blocks = config.startBlockNumber + size;
    console.log(` - size=${size} blocks=${blocks}`)
    if( blocks > config.endBlockNumber ){
        size = config.endBlockNumber - config.startBlockNumber;
        console.log(` -- resize to ${size}`)
    }
    console.log(`- scan: ${config.startBlockNumber+1}->${config.endBlockNumber} size=${size}`)

    const latest = await web3.eth.getBlock("latest");
    const block = parseInt(latest.number);

    for (let i = config.startBlockNumber+1; i < config.endBlockNumber; i += size) {
        if( endProcessing ) break;
        let args = {fromBlock: i, toBlock: i + size};
        if( args.toBlock > block )
            args.toBlock = args.toBlock--;
        try {
            const r = await votingEscrow.getPastEvents(args);
            await onEventData(r);
        } catch (e) {
            console.log(e.toString());
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const TOTAL = `# - VARA ${totalVARA} - veVARA ${totalVE} - total: ${allData.length}`;
    console.log(TOTAL);
    running = false;
}

async function getStartBlock() {
    try {
        const latest = await web3.eth.getBlock("latest");
        const block = parseInt(latest.number);
        const epochStart = parseInt((await bribe.methods.getEpochStart(latest.timestamp).call()).toString());
        if (config) {
            if( epochStart != config.epochStart ){
                console.log(`getStartBlock: epoch changed, resetting data.`)
                // reset the epoch data
                totalVARA += 0;
                totalVE += 0;
                info = [];
                allData = [];
            }
            const lastScannedBlock = config.endBlockNumber;
            config = {
                startBlockNumber: lastScannedBlock,
                endBlockNumber: block,
                epochStart: epochStart,
                epochEnd: parseInt(latest.timestamp),
                blocksDiff: block - lastScannedBlock
            };
        } else {
            const blocksBehind = parseInt((latest.timestamp - epochStart) / 6.4);
            const startBlockNumber = block - blocksBehind;
            config = {
                epochStart: epochStart,
                epochEnd: parseInt(latest.timestamp),
                startBlockNumber: startBlockNumber,
                endBlockNumber: block,
                blocksDiff: block - startBlockNumber
            };
        }

        const seconds = config.epochEnd - config.epochStart;
        console.log(`Scan ${config.blocksDiff} blocks, since ${getTimeStr(seconds)}.`);
        return true;
    }catch(e){
        console.log(`getStartBlock: STOP ${e.toString()}`);
    }
    return false;
}
function getTimeStr(seconds) {
    const duration = moment.duration(seconds, 'seconds');
    return duration.humanize();
}

async function exec(){
    const status = await getStartBlock();
    if( ! status ){
        console.log(`exec: STOP error loading block interval. Waiting next interaction.`)
        return;
    }
    try {
        await scanBlockchain();
    } catch (e) {
        console.log(`Error running the chain scan: ${e.toString()}`);
    }
}

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
async function main() {
    const app = express()
    const port = process.env.HTTP_PORT

    app.get('/', (req, res) => {
        const TOTAL = `<h1>Totals: - VARA ${totalVARA} - veVARA ${totalVE}</h1>`;
        let stats = [];
        stats.push(TOTAL);
        stats.push(`<table border width="100%"><tr><td>Address</td><td>Vara</td><td>veVara</td><td>Days</td><td>Date</td></tr>`);
        stats = stats.concat(info);
        stats.push(`</table>`)
        res.send(stats.join('\n'))
    })

    app.get('/api/v1/weekly-ve-lockers', (req, res) => {
        res.json( allData );
    })

    app.listen(port, () => {
        console.log(`- HTTP ${port}`)
    })

    console.log(`- RPC: ${process.env.RPC}`);

    await exec();
    setInterval(exec, ONE_MINUTE );
}

main();
