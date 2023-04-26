'use strict';
const moment = require('moment')
const express = require('express')
const Web3 = require('web3');
require('dotenv').config({path: '.env'});
const web3_utils = new Web3(process.env.RPC);
const fs = require('fs');
const {_} = require('lodash');

process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;


let startBlockNumber = 3708801, endBlockNumber, epochNumber = 0, epoch = 0;
let startBlockTimestamp;
let running = false;
const veAddress = '0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A';
const multicallAddress = '0xA47a335D1Dcef7039bD11Cbd789aabe3b6Af531f';
const voterAddress = '0x4eB2B9768da9Ea26E3aBe605c9040bC12F236a59';
let veNftStats = {};

let Deposit = [], Withdraw = [], Transfer = [], allData = [], nftByAddress = {};
let Gauges = [], holderInfo = [], POOL = [];
const abiVoter = JSON.parse(fs.readFileSync("./voter-abi.js", "utf8"));
const abiPair = JSON.parse(fs.readFileSync("./pair-abi.js", "utf8"));
const abiGauge = JSON.parse(fs.readFileSync("./gauge-abi.js", "utf8"));
const abiVe = JSON.parse(fs.readFileSync("./voting-escrow-abi.js", "utf8"));
const abiMulticall = JSON.parse(fs.readFileSync("./multicall-abi.js", "utf8"));

const YEAR = 365;
const DAY = 86400;
const FACTOR = 0.25 / YEAR;


function getEpochStart(timestamp) {
    const bribeStart = _bribeStart(timestamp);
    const bribeEnd = bribeStart + SEVEN_DAYS;
    return timestamp < bribeEnd ? bribeStart : bribeStart + SEVEN_DAYS;
}

function getEpoch(blockInfo){
    startBlockTimestamp = blockInfo.timestamp;
    const currentEpoch = parseInt( getEpochStart(startBlockTimestamp) );
    // console.log(`old epoch: @${epochNumber} (${epoch})`)
    if( epoch !== currentEpoch ){
        epochNumber++;
        epoch = currentEpoch;
        console.log(`new epoch: @${epochNumber} (${epoch})`)
    }
}

function loadData(){
    const r = JSON.parse( fs.readFileSync(`./data/Config.json`).toString() );
    startBlockNumber = r.startBlockNumber;
    epochNumber = parseInt(r.epochNumber);
    epoch = parseInt(r.epoch);
    Deposit = JSON.parse( fs.readFileSync(`./data/Deposit.json`).toString() );
    Withdraw = JSON.parse( fs.readFileSync(`./data/Withdraw.json`).toString() );
    Transfer = JSON.parse( fs.readFileSync(`./data/Transfer.json`).toString() );
    allData = JSON.parse( fs.readFileSync(`./data/allData.json`).toString() );
    nftByAddress = JSON.parse( fs.readFileSync(`./data/nftByAddress.json`).toString() );
    POOL = JSON.parse( fs.readFileSync(`./data/POOL.json`).toString() );
}

let saveDataCache = {};
function saveData(){
    if( saveDataCache.startBlockNumber !== startBlockNumber || saveDataCache.epochNumber !== epochNumber ) {
        const r = {
            startBlockNumber: startBlockNumber,
            epochNumber: epochNumber,
            epoch: epoch
        };
        fs.writeFileSync(`./data/Config.json`, JSON.stringify(r, undefined, '    '));
        saveDataCache.startBlockNumber = startBlockNumber;
        saveDataCache.epochNumber = epochNumber;
        saveDataCache.epoch = epoch;
    }
    if( saveDataCache.Deposit !== Deposit ) {
        fs.writeFileSync(`./data/Deposit.json`, JSON.stringify(Deposit,undefined, '   '));
        saveDataCache.Deposit = Deposit.length;
    }
    if( saveDataCache.Withdraw !== Withdraw.length ) {
        fs.writeFileSync(`./data/Withdraw.json`, JSON.stringify(Withdraw,undefined, '   '));
        saveDataCache.Withdraw = Withdraw;
    }
    if( saveDataCache.Transfer !== Transfer.length ) {
        fs.writeFileSync(`./data/Transfer.json`, JSON.stringify(Transfer,undefined, '   '));
        fs.writeFileSync(`./data/nftByAddress.json`, JSON.stringify(nftByAddress,undefined, '   '));
        saveDataCache.Transfer = Transfer.length;
    }
    if( saveDataCache.allData !== allData.length ) {
        fs.writeFileSync(`./data/allData.json`, JSON.stringify(allData,undefined, '   '));
        saveDataCache.allData = allData.length;
    }
    if( saveDataCache.POOL !== POOL.length ) {
        fs.writeFileSync(`./data/POOL.json`, JSON.stringify(POOL,undefined, '   '));
        saveDataCache.POOL = POOL.length;
    }
}

function computeVeVARA(amount, locktime, ts) {
    amount = parseFloat(amount);
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    const days = parseInt((locktime - ts) / DAY);
    return parseFloat(FACTOR * days * amount);
}


function getVeStats(value, locktime, ts){
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    let amount = parseFloat(web3_utils.utils.fromWei(value));
    const ve = computeVeVARA(amount, parseInt(locktime), parseInt(ts));
    const days = parseInt((locktime - ts) / DAY);
    const date = new Date(ts*1000).toISOString();
    return {amount, ve, days, date};
}
async function saveDeposit(votingEscrow, e, blockInfo, provider, tokenId, value, locktime, deposit_type, ts){
    /*
    DEPOSIT_FOR_TYPE,
    CREATE_LOCK_TYPE,
    INCREASE_LOCK_AMOUNT,
    INCREASE_UNLOCK_TIME,
    MERGE_TYPE
    MERGE_TYPE
    */
    deposit_type = parseInt(deposit_type);
    let type = 'DEPOSIT';
    if( deposit_type === 1 ) type = 'CREATE_LOCK';
    if( deposit_type === 2 ) type = 'INCREASE_LOCK_AMOUNT';
    if( deposit_type === 3 ) type = 'INCREASE_UNLOCK_TIME';
    if( deposit_type === 4 ) type = 'MERGE_TYPE';
    if( !locktime || parseInt(locktime) === 0 ) {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const LockedBalanceAtBlock = await votingEscrow.methods.locked(tokenId).call(undefined, e.blockNumber);
        locktime = LockedBalanceAtBlock.end;
    }

    const {amount, ve, days, date} = getVeStats(value, locktime, ts);
    console.log(`@${epochNumber} Deposit ${type}: ${provider} ${amount} ve=${ve}, days=${days}`);
    Deposit.push({
        blockTimestamp: blockInfo.timestamp,
        blockNumber: e.blockNumber,
        epochNumber: epochNumber,
        epoch: epoch,
        address: provider,
        valueInWei: value,
        valueInDecimal: amount,
        ve: ve,
        days: days,
        locktime: locktime,
        ts: ts,
        date: date,
        type: type,
        typeId: deposit_type,
        tx: e.transactionHash
    });
}
async function saveWithdraw(e, blockInfo, provider, tokenId, value){
    const amount = parseFloat(web3_utils.utils.fromWei(value));
    console.log(`@${epochNumber} Withdraw: ${provider} ${amount} #${tokenId}`);
    Deposit.push({
        blockTimestamp: blockInfo.timestamp,
        blockNumber: e.blockNumber,
        epochNumber: epochNumber,
        epoch: epoch,
        address: provider,
        valueInWei: value,
        valueInDecimal: amount,
        tx: e.transactionHash
    });
}

async function saveTransfer(e, blockInfo, from, to, tokenId){
    let type;
    if(!nftByAddress[from]) nftByAddress[from] = [];
    if(!nftByAddress[to]) nftByAddress[to] = [];
    if( from === '0x0000000000000000000000000000000000000000') {
        type = 'Mint';
        console.log(`@${epochNumber} ${type}: ${to} #${tokenId}`);
        nftByAddress[to].push(tokenId);
    }else if( to === '0x0000000000000000000000000000000000000000') {
        type = 'Burn';
        console.log(`@${epochNumber} ${type}: ${from} #${tokenId}`);
        nftByAddress[from].splice( nftByAddress[from].indexOf(tokenId), 1 );
    }else {
        type = 'Transfer';
        nftByAddress[from].splice( nftByAddress[from].indexOf(tokenId));
        nftByAddress[to].push(tokenId);
        console.log(`@${epochNumber} ${type}: ${from}->${to} #${tokenId}`);
    }
    Transfer.push({
        blockTimestamp: blockInfo.timestamp,
        blockNumber: e.blockNumber,
        epochNumber: epochNumber,
        epoch: epoch,
        type: type,
        from: from,
        to: to,
        tokenId: tokenId,
        tx: e.transactionHash
    });
}

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 86_400;
const SEVEN_DAYS = 7 * ONE_DAY;

function _bribeStart(timestamp) {
    return timestamp - (timestamp % SEVEN_DAYS);
}

async function getPastEvents(args){
    try{
        const web3 = new Web3(process.env.RPC);
        const votingEscrow = new web3.eth.Contract(abiVe, veAddress);
        const events = await votingEscrow.getPastEvents(args);
        for (let j = 0; j < events.length; j++) {
            const e = events[j];
            if (!e.event) continue;
            const txid = `${e.transactionHash}-${j}`;
            if( POOL.indexOf(txid) !== -1 ){
                console.log(`FOUND: TX=${txid} blockNumber=${e.blockNumber}`, args);
                continue;
            }
            POOL.push(txid);
            // event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
            // event Deposit( address indexed provider, uint tokenId, uint value, uint indexed locktime, DepositType deposit_type, uint ts );
            // event Withdraw(address indexed provider, uint tokenId, uint value, uint ts);
            const u = e.returnValues;
            if (e.event === 'Deposit'){
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                // console.log('e', e);
                // console.log('blockInfo', blockInfo);
                allData.push( {tx: e.transactionHash, block: e.blockNumber, event: e.event, returnValues: e.returnValues} );
                await saveDeposit(votingEscrow, e, blockInfo, u.provider, u.tokenId, u.value, u.locktime, u.deposit_type, u.ts );
            }else if (e.event === 'Withdraw') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                // console.log('e', e);
                // console.log('blockInfo', blockInfo);
                allData.push( {tx: e.transactionHash, block: e.blockNumber, event: e.event, returnValues: e.returnValues} );
                await saveWithdraw(e, blockInfo, u.provider, u.tokenId, u.value);
            }else if (e.event === 'Transfer'){
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                //console.log('saveTransfer', u);
                // console.log('blockInfo', blockInfo);
                allData.push( {tx: e.transactionHash, block: e.blockNumber, event: e.event, returnValues: e.returnValues} );
                await saveTransfer( e, blockInfo, u.from, u.to, u.tokenId );
            }else if (e.event === 'Supply'){
            }else if (e.event === 'Approval'){
            }else if (e.event === 'ApprovalForAll'){
            }else{
                console.log('non mapped event', e);
            }
        }
        return true;
    }catch(e){
        console.log('getPastEvents', args, e.toString());
        return false;
    }
}
async function processEvents(){
    if( running === true ){
        console.log(`running: start=${startBlockNumber} end=${endBlockNumber} epochNumber=${epochNumber}`);
        return;
    }
    running = true;
    let web3 = new Web3(process.env.RPC);
    let size =  1000
    const blocks = startBlockNumber + size;
    const latest = await web3.eth.getBlock("latest");
    startBlockTimestamp = latest.timestamp;
    endBlockNumber = latest.number;
    if( blocks > endBlockNumber ){
        size = endBlockNumber - startBlockNumber;
        console.log(`@${epochNumber} -- resize to ${size}`)
    }

    for (let i = startBlockNumber; i < endBlockNumber; i += size) {
        let args = {fromBlock: i, toBlock: i + size - 1};
        if( args.toBlock > endBlockNumber ) {
            console.log(`@${epochNumber} getPastEvents`, args, ` resize: ${args.toBlock}->${endBlockNumber}`);
            args.toBlock = endBlockNumber;
        }else{
            console.log(`@${epochNumber} getPastEvents`, args, ` latest.number=${latest.number}`);
        }

        let retryCount = 0;
        while( await getPastEvents(args) !== true ){
            console.log(`@${epochNumber} getPastEvents error retrying in 10s...`, args);
            await new Promise(resolve => setTimeout(resolve, 10000));
            if( retryCount >= 10 ){
                saveData();
                process.exit(0);
            }
            ++retryCount;
        }
        startBlockNumber = args.toBlock;
        saveData();
    }

    running = false;
}

async function main() {
    const app = express()
    const port = process.env.HTTP_PORT

    app.get('/', async (req, res) => {
        res.json( await getInfo() );
    })

    app.get('/info', async (req, res) => {
        const stats = await getInfo();
        let lines = [];
        lines.push(`<h1>Global Info</h1>`);
        lines.push(`<hr><ul>`);
        lines.push(`<li>Time Behind: ${stats.timeBehind}</li>`);
        lines.push(`<li>Processed Block Timestamp: ${stats.processedBlockTimestamp}</li>`);
        lines.push(`<li>Processed Block: ${stats.processedBlock}</li>`);
        lines.push(`<li>Blocks Behind: ${stats.blocksBehind}</li>`);
        lines.push(`<li>Current Block: ${stats.currentBlock}</li>`);
        lines.push(`<li>Current Epoch Number: ${stats.currentEpochNumber}</li>`);
        lines.push(`<li>Current Epoch Timestamp: ${stats.currentEpochTimestamp}</li>`);
        lines.push(`<li>Deposit: ${Deposit.length}</li>`);
        lines.push(`<li>Withdraw: ${Withdraw.length}</li>`);
        lines.push(`<li>Transfer: ${Transfer.length}</li>`);
        lines.push(`<li>All transactions processed: ${allData.length}</li>`);
        lines.push(`<li>Total of veNft Holders: ${holderInfo.length}</li>`);
        lines.push(`<li>Total ve:: ${veNftStats.veAmount}</li>`);
        lines.push(`<li>Total tokens: ${veNftStats.tokensAmount}</li>`);
        lines.push(`</ul>`);
        res.send( lines.join('\n') );
    })

    app.get('/api/v1/deposit/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json( Deposit.filter( (r)=>{ return r.epochNumber===argEpoch } ) );
    })
    app.get('/api/v1/withdraw/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json( Withdraw.filter( (r)=>{ return r.epochNumber===argEpoch } ) );
    })

    app.get('/api/v1/transfer/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json( Transfer.filter( (r)=>{ return r.epochNumber===argEpoch } ) );
    })

    app.get('/api/v1/all/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json( allData.filter( (r)=>{ return r.epochNumber===argEpoch } ) );
    })

    app.get('/api/v1/nftByAddress/:address', (req, res) => {
        const address = req.params.address;
        res.json( nftByAddress[address] ? nftByAddress[address] : [] );
    })

    app.get('/api/v1/allHoldersBalance', async (req, res) => {
        let sortBy = req.query.sortBy ? req.query.sortBy : 'tokenId';
        let orderBy = req.query.orderBy ? req.query.orderBy : 'asc';
        res.json( _.orderBy(holderInfo, byKey(sortBy), [orderBy]) );
    })

    app.get('/api/v1/gaugeInfo', async (req, res) => {
        let lines = [`<h1>Gauges (${Gauges.length})</h1>`];
        for( let i in Gauges ) {
            const r = Gauges[i];
            lines.push('-----------------------------------------------------------')
            if (r.isAlive) {
                lines.push(` - ${i}: Gauge: ${r.gaugeAddress} ${r.symbol}`);
            } else {
                lines.push(` - ${i}: Gauge: ${r.gaugeAddress} ${r.symbol} [DEAD]`);
            }
            lines.push(`     Pool: ${r.poolAddress}`);
            lines.push(`     Pair Fees: ${r.fees}`);
            lines.push(`     Internal Bribe: ${r.internal_bribe}`);
            lines.push(`     External Bribe: ${r.external_bribe}`);
        }
        const html = `<pre>${lines.join('\n')}`;
        res.send( html );
    })

    app.get('/api/v1/gauges', async (req, res) => {
        res.json( Gauges );
    })


    app.listen(port, () => {
        console.log(`- HTTP ${port}`)
    })

    console.log(`- RPC: ${process.env.RPC}`);

    loadData();
    exec_gauge_info();
    exec_holder_info();
    setInterval(exec_holder_info, ONE_MINUTE );
    setInterval(exec_gauge_info, ONE_HOUR );
    processEvents();
    setInterval(processEvents, ONE_MINUTE );
}

async function getInfo(){
    const latest = await web3_utils.eth.getBlock("latest");
    const blocksBehind = latest.number - startBlockNumber;
    const since = moment.unix(startBlockTimestamp).fromNow();
    return {
        timeBehind: since,
        processedBlockTimestamp: startBlockTimestamp,
        processedBlock: startBlockNumber,
        blocksBehind: blocksBehind,
        currentBlock: latest.number,
        currentEpochNumber: epochNumber,
        currentEpochTimestamp: epoch,
        Deposit: Deposit.length,
        Withdraw: Withdraw.length,
        Transfer: Transfer.length,
        allData: allData.length,
        veNftHolders: holderInfo.length,
        veAmount: veNftStats.veAmount,
        tokensAmount: veNftStats.tokensAmount
    };
}

function byKey(key) {
    return function (o) {
        const v = parseInt(o[key], 10);
        return isNaN(v) ? o[key] : v;
    };
}


async function exec_holder_info(){
    const web3 = new Web3(process.env.RPC);
    const votingEscrow = new web3.eth.Contract(abiVe, veAddress);
    let calls = [], addresses = [];
    for( let address in nftByAddress ) {
        for( let i in nftByAddress[address] ) {
            const tokenId = nftByAddress[address][i];
            const locked = await votingEscrow.methods.locked(tokenId);
            const lockedAbi = locked.encodeABI();
            const call =
                {
                    target: veAddress,
                    callData: lockedAbi,
                    fee: 0
                };
            calls.push(call);
            addresses.push({tokenId: tokenId, owner: address});
        }
    }
    const ts = parseInt(new Date().getTime()/1000);
    const r = await MULTICALL(calls);
    let balances = [];
    let stats = {veAmount: 0, tokensAmount: 0};
    for( let i in r ){
        const info = web3.eth.abi.decodeParameters(['int128', 'uint256'], r[i]);
        const {amount, ve, days, date} = getVeStats(info[0], info[1], ts);
        if( amount > 0 && ve > 0 && days > 0 ) {
            balances.push({
                tokenId: addresses[i].tokenId,
                owner: addresses[i].address,
                tokenAmount: amount,
                veAmount: ve,
                endDate: date,
                endTimestamp: info[1],
                days: days
            });
            stats.veAmount += ve;
            stats.tokensAmount += amount;
        }
        // console.log(addresses[i]);
    }

    veNftStats = stats;
    holderInfo = balances;
    console.log(`exec_holder_info: ${holderInfo.length}`)

}

async function MULTICALL(calls){
    //
    let results = [];
    let j = 0;
    const limit = 1000;
    while( j < calls.length ){
        let _calls = [];
        let l = 0;
        for( let i = j ; i < j+limit ; i++ ){
            if( ! calls[i] ) break;
            _calls[l] = calls[i];
            l++;
        }

        const web3 = new Web3(process.env.RPC);
        const multicall = new web3.eth.Contract(abiMulticall, multicallAddress);
        const _results = await cmd( multicall.methods.aggregate(_calls) );
        results = results.concat(_results[1]);
        j += limit;
    }
    //console.log(`class=${calls.length} results=${results.length}`)
    return results;
}

async function exec_gauge_info(){
    const web3 = new Web3(process.env.RPC);
    const voter = new web3.eth.Contract(abiVoter, voterAddress);

    let lines = [];
    const length = await cmd(voter.methods.length());
    for (let i = 0; i < length; ++i) {
        const poolAddress = await cmd(voter.methods.pools(i));
        const gaugeAddress = await cmd(voter.methods.gauges(poolAddress));

        const gauge = new web3.eth.Contract(abiGauge, gaugeAddress);
        const pool = new web3.eth.Contract(abiPair, poolAddress);

        const isAlive = await cmd(voter.methods.isAlive(gaugeAddress));
        const symbol = await cmd(pool.methods.symbol());
        const fees = await cmd(pool.methods.fees());
        const internal_bribe = await cmd(gauge.methods.internal_bribe());
        const external_bribe = await cmd(gauge.methods.external_bribe());
        console.log(`- processing gauge ${i+1} of ${length}: ${symbol}`);
        lines.push({
            index: i,
            poolAddress: poolAddress,
            gaugeAddress: gaugeAddress,
            isAlive: isAlive,
            symbol: symbol,
            fees: fees,
            internal_bribe: internal_bribe,
            external_bribe: external_bribe,
        });

    }
    Gauges = lines;
}

async function cmd(fctl){
    let retryCount = 0;
    while( true ){
        try{
            return await fctl.call();
        }catch (e) {
            console.log(`cmd-error ${retryCount}: ${e.toString()}`);
            // console.trace();
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        if( retryCount >= 10 ){
            console.log('--EXIT--')
            process.exit(0);
        }
        ++retryCount;
    }
}


main();
