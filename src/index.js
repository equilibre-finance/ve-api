'use strict';

const fs = require('fs');
let envFile = '.env';
// check if .env exits on current dir:
if (!fs.existsSync(envFile)) {
    envFile = '../.env';
}
require('dotenv').config({path: envFile});

const moment = require('moment')
const express = require('express')
const Web3 = require('web3');

const web3_utils = new Web3(process.env.RPC);
let web3 = new Web3(process.env.RPC);
function fromWei(value){
    return web3_utils.utils.fromWei(value.toString(), 'ether');
}
// wei to currency
function w2c(num) {
    num = parseFloat(fromWei(num));
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
function currency(num) {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
const {_} = require('lodash');

const Redis = require('redis');
let redis;

const cors = require('cors');

const { query } = require("array-query");

process.on('uncaughtException', function (err) {
    console.error(err);
});

process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;


let startBlockNumber = parseInt(process.env.START_BLOCK_NUMBER);
let startBlockTimestamp = parseInt(process.env.START_BLOCK_TIMESTAMP);

let endBlockNumber, epochNumber = 0, epoch = 0;

let running = false;
const veAddress = process.env.VE_ADDRESS;
const multicallAddress = process.env.MULTICALL_ADDRESS;
const voterAddress = process.env.VOTER_ADDRESS;
const oracleAddress = process.env.ORACLE_ADDRESS;
const veapiAddress = process.env.VEAPI_ADDRESS;
let veNftStats = {};

let Deposit = [], Withdraw = [], Transfer = [], allData = [], nftByAddress = {};
let Gauges = [], holderInfo = [], POOL = [];

const abiVoter = JSON.parse(fs.readFileSync("./voter-abi.js", "utf8"));
const abiPair = JSON.parse(fs.readFileSync("./pair-abi.js", "utf8"));
const abiGauge = JSON.parse(fs.readFileSync("./gauge-abi.js", "utf8"));
const abiVe = JSON.parse(fs.readFileSync("./voting-escrow-abi.js", "utf8"));
const abiMulticall = JSON.parse(fs.readFileSync("./multicall-abi.js", "utf8"));
const abiOracle = JSON.parse(fs.readFileSync("./oracle-abi.js", "utf8"));
const abiVeApi3 = JSON.parse(fs.readFileSync("./veapi-abi.js", "utf8"));

const votingEscrow = new web3.eth.Contract(abiVe, veAddress);
const multicall = new web3.eth.Contract(abiMulticall, multicallAddress);
const veApi = new web3_utils.eth.Contract(abiVeApi3, veapiAddress);
const oracle = new web3_utils.eth.Contract(abiOracle, oracleAddress);
const voter = new web3.eth.Contract(abiVoter, voterAddress);

const YEAR = 365;
const DAY = 86400;
const FACTOR = 0.25 / YEAR;
let startEpoch;

function getEpochStart(timestamp) {
    const bribeStart = _bribeStart(timestamp);
    const bribeEnd = bribeStart + SEVEN_DAYS;
    return timestamp < bribeEnd ? bribeStart : bribeStart + SEVEN_DAYS;
}

function getEpoch(blockInfo) {
    startBlockTimestamp = blockInfo.timestamp;
    const currentEpoch = parseInt(getEpochStart(startBlockTimestamp));
    epochNumber = parseInt((currentEpoch - startEpoch) / SEVEN_DAYS);
    epoch = epochNumber;
    return epochNumber;
}

async function loadData() {

    // this timestamp is the contract deployment date: 2021-02-19T00:00:10.000Z
    startEpoch = parseInt(getEpochStart(startBlockTimestamp));

    const r = await get(`Config`, {"startBlockNumber": startBlockNumber, "epochNumber": 0, "epoch": 0} );
    startBlockNumber = parseInt(r.startBlockNumber);
    epochNumber = parseInt(r.epochNumber);
    epoch = parseInt(r.epoch);

    Deposit = await get(`Deposit`, []);
    Withdraw = await get(`Withdraw`, []);
    Transfer = await get(`Transfer`, []);
    allData = await get(`allData`, []);
    nftByAddress = await get(`nftByAddress`, {});
    POOL = await get(`POOL`, []);

    console.log(`---------------------------------------------------------------`)
    console.log(`Config:`, r);
    console.log(`Deposit:`, Deposit.length);
    console.log(`Withdraw:`, Withdraw.length);
    console.log(`Transfer:`, Transfer.length);
    console.log(`allData:`, allData.length);
    console.log(`nftByAddress:`, Object.keys(nftByAddress).length);
    console.log(`POOL:`, POOL.length);
    console.log(`---------------------------------------------------------------`)

}

async function saveData() {

    const r = {
        startBlockNumber: startBlockNumber,
        epochNumber: epochNumber,
        epoch: epoch
    };
    await set(`Config`, r);
    await set(`Deposit`, Deposit);
    await set(`Withdraw`, Withdraw);
    await set(`Transfer`, Transfer);
    await set(`nftByAddress`, nftByAddress);
    await set(`allData`, allData);
    await set(`POOL`, POOL);
    // print stats count about each type of event:
    console.log(`Deposit: ${Deposit.length}, Withdraw: ${Withdraw.length}, Transfer: ${Transfer.length}, allData: ${allData.length}, nftByAddress: ${Object.keys(nftByAddress).length}, POOL: ${POOL.length}`);
}

function computeVeVARA(amount, locktime, ts) {
    amount = parseFloat(amount);
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    const days = parseInt((locktime - ts) / DAY);
    return parseFloat(FACTOR * days * amount);
}


function getVeStats(value, locktime, ts) {
    value = value ? value : 0;
    locktime = locktime ? locktime : 0;
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    let amount = parseFloat(fromWei(value));
    const ve = computeVeVARA(amount, parseInt(locktime), parseInt(ts));
    const days = parseInt((locktime - ts) / DAY);
    const date = new Date(ts * 1000).toISOString();
    return {amount, ve, days, date};
}
async function getLockedInfo(e, tokenId){
    /*
    struct LockedBalance {
        int128 amount;
        uint end;
    }
    */
    try {
        return await votingEscrow.methods.locked(tokenId).call(undefined, e.blockNumber);
    }catch (e) {
        console.log(`getLockedInfo error tokenId=${tokenId}: ${e.message}`)
        return {amount: 0, end: 0};
    }
}
async function saveDeposit(votingEscrow, e, blockInfo, provider, tokenId, value, locktime, deposit_type, ts) {
    deposit_type = parseInt(deposit_type);
    let type = 'DEPOSIT';
    if (deposit_type === 1) type = 'CREATE_LOCK';
    if (deposit_type === 2) type = 'INCREASE_LOCK_AMOUNT';
    if (deposit_type === 3) type = 'INCREASE_UNLOCK_TIME';
    if (deposit_type === 4) type = 'MERGE_TYPE';
    if (!locktime || parseInt(locktime) === 0) {
        const LockedBalanceAtBlock = await getLockedInfo(e, tokenId);
        locktime = LockedBalanceAtBlock.end;
    }

    const {amount, ve, days, date} = getVeStats(value, locktime, ts);
    //console.log(`\t@${epochNumber} Deposit ${type}: ${provider} ${amount} ve=${ve}, days=${days}`);
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

async function saveWithdraw(e, blockInfo, provider, tokenId, value) {
    const amount = parseFloat(fromWei(value));
    //console.log(`\t@${epochNumber} Withdraw: ${provider} ${amount} #${tokenId}`);
    Withdraw.push({
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

function saveNftByAddress(address, tokenId, type) {
    if (!nftByAddress[address]) {
        nftByAddress[address] = [];
    }

    if (type === 'Mint') {
        if( !nftByAddress[address].includes(tokenId) )
            nftByAddress[address].push(tokenId);
    }else if (type === 'Burn') {
        nftByAddress[address].splice(nftByAddress[address].indexOf(tokenId), 1);
    }
    //console.log(`saveNftByAddress ${type}: ${address} #${tokenId} (${nftByAddress[address].length}})`);
}

async function saveTransfer(e, blockInfo, from, to, tokenId) {
    let type;
    const {amount, end} = await getLockedInfo(e, tokenId);
    const {valueInDecimal, ve, days, date} = getVeStats(amount, end, blockInfo.timestamp);
    if (from === '0x0000000000000000000000000000000000000000') {
        type = 'Mint';
        saveNftByAddress(to, tokenId, 'Mint');
    } else if (to === '0x0000000000000000000000000000000000000000') {
        type = 'Burn';
        saveNftByAddress(from, tokenId, 'Burn');
    } else {
        type = 'Transfer';
        saveNftByAddress(from, tokenId, 'Burn');
        saveNftByAddress(to, tokenId, 'Mint');
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
        valueInWei: amount,
        valueInDecimal: valueInDecimal,
        ve: ve,
        days: days,
        date: date,
        locktime: end,
        ts: blockInfo.timestamp,
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
function pushAllData(e) {
    allData.push({
        epochNumber: epochNumber,
        tx: e.transactionHash,
        block: e.blockNumber,
        event: e.event,
        returnValues: e.returnValues
    });
}
function pushTxToPool(tx) {
    if (POOL.indexOf(tx) !== -1) return;
    POOL.push(tx);
}
async function getPastEvents(args) {
    try {
        const events = await votingEscrow.getPastEvents(args);
        for (let j = 0; j < events.length; j++) {
            const e = events[j];
            if (!e.event) continue;
            const txId = `${e.transactionHash}-${j}`;
            pushTxToPool(txId);
            const u = e.returnValues;
            if (e.event === 'Deposit') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                pushAllData(e);
                await saveDeposit(votingEscrow, e, blockInfo, u.provider, u.tokenId, u.value, u.locktime, u.deposit_type, u.ts);
            } else if (e.event === 'Withdraw') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                pushAllData(e);
                await saveWithdraw(e, blockInfo, u.provider, u.tokenId, u.value);
            } else if (e.event === 'Transfer') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                pushAllData(e);
                await saveTransfer(e, blockInfo, u.from, u.to, u.tokenId);
            }
        }
        return true;
    } catch (e) {
        console.log('getPastEvents', e);
        return false;
    }
}

let processEventRetryCount = 0, processEventRetryLastEvent = 0;
let globalRetryCount = 0;

async function processEvents() {
    let startTime = moment();
    if (running === true) {
        if (processEventRetryLastEvent === 0) {
            processEventRetryLastEvent = startBlockNumber;
        } else if (processEventRetryLastEvent == startBlockNumber) {
            ++processEventRetryCount;
        } else {
            processEventRetryLastEvent = startBlockNumber;
            processEventRetryCount = 0;
        }
        console.log(`\tSKIP: start=${startBlockNumber} end=${endBlockNumber} epochNumber=${epochNumber} retry=${processEventRetryCount}/${processEventRetryLastEvent}`);
        return;
    }
    running = true;
    let size = 1000
    const blocks = parseInt(startBlockNumber) + parseInt(size);
    let latest;
    while (!latest) {
        try {
            latest = await web3.eth.getBlock("latest");
            break;
        } catch (e) {
            console.log(`\t--ERROR GETTING LAST BLOCK, RETRY IN 10s... --`, e.toString());
            web3 = new Web3(process.env.RPC);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    startBlockTimestamp = latest.timestamp;
    endBlockNumber = latest.number;
    if (blocks > endBlockNumber) {
        size = endBlockNumber - startBlockNumber;
        console.log(`\t@${epochNumber} -- resize to ${size}`)
    }

    const totalBlocks = endBlockNumber - startBlockNumber;
    for (let i = startBlockNumber; i < endBlockNumber; i += size) {
        let args = {fromBlock: i, toBlock: i + size - 1};
        if (args.toBlock > endBlockNumber) args.toBlock = endBlockNumber;

        while (await getPastEvents(args) !== true) {
            web3 = new Web3(process.env.RPC);
            console.log(`\t@${epochNumber} getPastEvents error retrying in 10s...`, args);
            await new Promise(resolve => setTimeout(resolve, 10000));
            ++globalRetryCount;
        }

        startBlockNumber = args.toBlock;
        const pendingBlocks = endBlockNumber - startBlockNumber;
        const processedBlocks = totalBlocks - pendingBlocks;
        // compute the pending blocks percentage left to finish this loop:
        const pendingBlocksPercent = getPercentLeft(totalBlocks, pendingBlocks, processedBlocks);

        let endTime = moment();
        let timeTaken = moment.duration(endTime.diff(startTime));
        let timeLeft = moment.duration(timeTaken.asSeconds() * (pendingBlocks / processedBlocks), 'seconds');
        const timeInfo = `[${timeTaken.humanize()} of ${timeLeft.humanize()} left]`;
        console.log(`@epoch=${epochNumber} ${pendingBlocksPercent}% ${timeInfo} pending=${pendingBlocks} processed=${processedBlocks} retry=${globalRetryCount}`);
        await saveData();
        // if( globalRetryCount >= 10 ) process.exit(0);
        // globalRetryCount++;
    }

    running = false;
}

function getPercentLeft(totalBlocks, pendingBlocks, processedBlocks) {
    const p = 100 - ((pendingBlocks / totalBlocks) * 100);
    return p.toFixed(4);
}

async function cache_init(){
    const redisConfig = {
        url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    };
    redis = Redis.createClient(redisConfig);
    redis.on('error', err => console.log('Redis Client Error', err));
    await redis.connect();
}

async function get(key, defaultValue) {
    try{
        let value = await redis.get(key);
        if( ! value ){
            value = await set(key, defaultValue);
        }
        value = JSON.parse(value);
        //console.log('get', key, value);
        return value;
    }catch (e){
        console.log('get error', key, e);
        return defaultValue;
    }
}
async function set(key, object) {
    try {
        const value = JSON.stringify(object);
        await redis.set(key, value);
        return value;
    }catch(e){
        console.log('set error', key, e);
        return object;
    }
}


function byKey(key) {
    return function (o) {
        const v = parseInt(o[key], 10);
        return isNaN(v) ? o[key] : v;
    };
}

function filter(array, params, q) {
    const debug = !!q.debug;
    if(debug){
        console.log('debug array 1', array.length, params, q);
        console.log('array[0]', array[0]);
    }
    const ignore = ['offset', 'limit', 'epoch', 'orderBy', 'sortBy'];
    array = array || [];

    if( array.length === 0 ) return array;

    let epoch = parseInt(params.epoch > 0 ?
        params.epoch :
        q.epoch > 0 ? q.epoch : epochNumber
    );

    const offset = q.offset ? parseInt(q.offset) : 0;
    const limit = q.limit ? parseInt(q.limit) : 10_000;

    // first filter all data by epoch:
    if( epoch > 0 && array && array.length > 0 && array[0].hasOwnProperty('epochNumber') ){
        array = array.filter(function(o){
            return o.epochNumber === epoch;
        });
    }

    //console.log(`q`, q.q);
    if( q.q ) {
        // q { address: { eq: '0xAf79312EB821871208ac76A80c8E282f8796964e' } }
        //query("age").gt(20).on(array);
        for(const field in q.q){
            for( const operand in q.q[field] ) {
                const value = q.q[field][operand];
                const total = array.length;
                // const firstJacob = query("firstName").is("Jacob").first(users);
                array = query(field)[`${operand}`](value).on(array);
                //array = query(field).is(value).on(array);
                if(debug) console.log(`debug query("${field}").${operand}("${value}").on("${total}")=${array.length}`);
            }
        }
    }


    // sort and order before apply limit and offset:
    if (q.orderBy && q.sortBy) {
        array = _.orderBy(array, byKey(q.sortBy), [q.orderBy]);
    }

    // now apply offset:
    array = array.slice(offset, offset + limit);
    if(debug) console.log('debug array 2', array.length);
    return array;
}


async function main() {
    await cache_init();

    const app = express()
    app.options('*', cors()) // include before other routes
    app.disable('x-powered-by');
    app.use(function(req, res, next) {
        res.header('X-XSS-Protection', 0);
        next();
    });
    const port = process.env.HTTP_PORT

    app.get('/stats', async (req, res) => {
        const info = await getOracleInfo();
        let html = `<h1>Oracle Stats</h1>`;
        html += `<hr><ul>`;
        html += `<li>timestamp: ${info.timestamp}</li>`;
        html += `<li>price: ${w2c(info.price)}</li>`;
        html += `<li>circulatingSupply: ${w2c(info.circulatingSupply)}</li>`;
        html += `<li>outstandingSupply: ${w2c(info.outstandingSupply)}</li>`;
        html += `<li>dilutedSupply: ${w2c(info.dilutedSupply)}</li>`;
        html += `<li>inNFT: ${w2c(info.inNFT)}</li>`;
        html += `<li>inGauges: ${w2c(info.inGauges)}</li>`;
        html += `<li>inExcluded: ${w2c(info.inExcluded)}</li>`;
        html += `<li>veNFTTotalSupply: ${w2c(info.veNFTTotalSupply)}</li>`;
        html += `<li>lockRatio: ${w2c(info.lockRatio)}</li>`;
        html += `<li>liquidity: ${w2c(info.liquidity)}</li>`;
        html += `<li>circulatingMarketCap: ${w2c(info.circulatingMarketCap)}</li>`;
        html += `<li>marketCap: ${w2c(info.marketCap)}</li>`;
        html += `<li>fdv: ${w2c(info.fdv)}</li>`;
        html += `<li>lockedMarketCap: ${w2c(info.lockedMarketCap)}</li>`;
        html += `</ul>`;
        html += `<hr/>`;
        html += `json api endpoint: <a href="/api/v1/stats">/api/v1/stats</a>`;
        res.send(html);
    })
    app.get('/api/v1/stats', async (req, res) => {
        res.json(await getOracleInfo());
    })

    app.get('/api/v1/price/:poolAddress', async (req, res) => {
        const poolAddress = req.params.poolAddress;
        const poolInfo = await getPoolInfo(poolAddress);
        res.json(poolInfo);
    });

    app.get('/api/v1/info', async (req, res) => {
        res.json( await getInfo() );
    })

    app.get('/', async (req, res) => {
        res.json( await getInfo() );
    });

    app.get('/info', async (req, res) => {
        const stats = await getInfo();
        let lines = [];
        lines.push(`<h1>Global Info</h1>`);
        lines.push(`<hr><ul>`);
        lines.push(`<li>RPC status: ${stats.rpcStatus}</li>`);
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
        res.send(lines.join('\n'));
    })

    app.get('/api/v1/deposit/:epoch', (req, res) => {
        res.json( filter(Deposit, req.params, req.query) );
    })
    app.get('/api/v1/withdraw/:epoch', (req, res) => {
        res.json( filter(Withdraw, req.params, req.query) );
    })

    app.get('/api/v1/transfer/:epoch', (req, res) => {
        res.json( filter(Transfer, req.params, req.query) );
    })

    app.get('/api/v1/all/:epoch', (req, res) => {
        res.json( filter(allData, req.params, req.query) );
    })

    app.get('/api/v1/nftByAddress/:address', (req, res) => {
        //console.log('nftByAddress', nftByAddress)
        res.json(
            nftByAddress[req.params.address] ?
            nftByAddress[req.params.address] : []
        );
    })

    app.get('/api/v1/allHoldersBalance', async (req, res) => {
        res.json( holderInfo );
    })

    app.get('/api/v1/gaugeInfo', async (req, res) => {
        let lines = [`<h1>Gauges (${Gauges.length})</h1>`];
        for (let i in Gauges) {
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
        res.send(html);
    })

    app.get('/api/v1/gauges', async (req, res) => {
        res.json( filter(Gauges, req.params, req.query) );
    })

    app.listen(port, async () => {
        console.log(`- HTTP ${port}`);
        console.log(`- RPC: ${process.env.RPC}`);
        await loadData();

        setInterval(exec_holder_info, ONE_MINUTE);
        setInterval(exec_gauge_info, ONE_HOUR);
        setInterval(processEvents, ONE_MINUTE);

        //exec_gauge_info();
        //exec_holder_info();
        processEvents();
    })
}

async function getInfo() {
    //await new Promise(resolve => setTimeout(resolve, 1000));
    let latestBlock = 0, blocksBehind = -1;
    let rpcStatus = `RPC ${process.env.RPC} OK.`;
    try {
        const latest = await web3_utils.eth.getBlock("latest");
        latestBlock = latest.number;
        blocksBehind = latestBlock - startBlockNumber;
    } catch (e) {
        rpcStatus = `RPC ${process.env.RPC} error: ${e.toString()}`;
        console.log(`getInfo: ${e.toString()}`);
    }

    const since = moment.unix(startBlockTimestamp).fromNow();
    return {
        rpcStatus: rpcStatus,
        timeBehind: since,
        processedBlockTimestamp: startBlockTimestamp,
        processedBlock: startBlockNumber,
        blocksBehind: blocksBehind,
        currentBlock: latestBlock,
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

async function getPoolInfo(poolAddress){
    const price = await oracle.methods.p_t_coin_usd(poolAddress).call();
    return {price: price};
}

async function getOracleInfo() {
    // initialize contracts

    const info = await veApi.methods.info().call();
    return {
        timestamp: info[0],
        price: info[1],
        circulatingSupply: info[2],
        outstandingSupply: info[3],
        dilutedSupply: info[4],
        inNFT: info[5],
        inGauges: info[6],
        inExcluded: info[7],
        veNFTTotalSupply: info[8],
        lockRatio: info[9],
        liquidity: info[10],
        circulatingMarketCap: info[11],
        marketCap: info[12],
        fdv: info[13],
        lockedMarketCap: info[14]
    };

}

function Call(method) {
    const call = {
        "target": method._parent._address,
        "callData": method.encodeABI(),
        "fee": 0
    };
    return call;
}

async function exec_holder_info() {
    
    let calls = [], addresses = [];
    for (let address in nftByAddress) {
        for (let i in nftByAddress[address]) {
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
    const ts = parseInt(new Date().getTime() / 1000);
    const r = await MULTICALL(calls);
    
    let balances = [];
    let stats = {veAmount: 0, tokensAmount: 0};
    for (let i in r) {
        const info = web3.eth.abi.decodeParameters(['int128', 'uint256'], r[i]);
        const {amount, ve, days, date} = getVeStats(info[0], info[1], ts);
        if (amount > 0 && ve > 0 && days > 0) {
            balances.push({
                tokenId: addresses[i].tokenId,
                owner: addresses[i].owner,
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
    console.log(`- Holder info: ${balances.length}, ${currency(stats.veAmount)} veNFT, ${currency(stats.tokensAmount)} VARA.`);

}

async function MULTICALL(calls, abi) {
    //
    let results = [];
    let j = 0;
    const limit = 1000;
    while (j < calls.length) {
        let _calls = [];
        let l = 0;
        for (let i = j; i < j + limit; i++) {
            if (!calls[i]) break;
            _calls[l] = calls[i];
            l++;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const _results = await cmd(multicall.methods.aggregate(_calls));
        results = results.concat(_results[1]);
        j += limit;
    }

    if (abi) {
        const web3 = new Web3(process.env.RPC);
        for (let i in results) {
            results[i] = web3.eth.abi.decodeParameters(abi, results[i])[0];
        }
        return results;
    }
    return results;
}

async function exec_gauge_info() {
    let lines = [];
    const length = await cmd(voter.methods.length());
    let getPoolsAddresses = [], getGaugeAddress = [];
    for (let i = 0; i < length; ++i) {
        getPoolsAddresses.push(Call(voter.methods.pools(i)));
    }
    getPoolsAddresses = await MULTICALL(getPoolsAddresses, ['address']);
    for (let i = 0; i < length; ++i) {
        getGaugeAddress.push(Call(voter.methods.gauges(getPoolsAddresses[i])));
    }
    getGaugeAddress = await MULTICALL(getGaugeAddress, ['address']);

    let getIsAlive = [], getSymbol = [], getFees = [], getInternalBribe = [], getExteranlBribe = [];
    for (let i = 0; i < length; ++i) {
        const poolAddress = getPoolsAddresses[i];
        const gaugeAddress = getGaugeAddress[i];

        const gauge = new web3.eth.Contract(abiGauge, gaugeAddress);
        const pool = new web3.eth.Contract(abiPair, poolAddress);

        getIsAlive.push(Call(voter.methods.isAlive(gaugeAddress)));
        getSymbol.push(Call(pool.methods.symbol()));
        getFees.push(Call(pool.methods.fees()));
        getInternalBribe.push(Call(gauge.methods.internal_bribe()));
        getExteranlBribe.push(Call(gauge.methods.external_bribe()));


    }

    getIsAlive = await MULTICALL(getIsAlive, ['bool']);
    getSymbol = await MULTICALL(getSymbol, ['string']);
    getFees = await MULTICALL(getFees, ['address']);
    getInternalBribe = await MULTICALL(getInternalBribe, ['address']);
    getExteranlBribe = await MULTICALL(getExteranlBribe, ['address']);

    for (let i = 0; i < length; ++i) {
        const poolAddress = getPoolsAddresses[i];
        const gaugeAddress = getGaugeAddress[i];
        const isAlive = getIsAlive[i];
        const symbol = getSymbol[i];
        const fees = getFees[i];
        const internal_bribe = getInternalBribe[i];
        const external_bribe = getExteranlBribe[i];
        // console.log(`- processing gauge ${i+1} of ${length}: ${symbol}`);
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
    console.log(`gauges: ${lines.length}`);
    Gauges = lines;
}

async function cmd(fctl) {
    let retryCount = 0;
    while (true) {
        try {
            //await new Promise(resolve => setTimeout(resolve, 1000));
            return await fctl.call();
        } catch (e) {
            console.log(`cmd-error ${fctl._method.name}() ${retryCount}: ${e.toString()}`);
            //console.trace();
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        // if( retryCount >= 10 ){
        //     console.log('--EXIT--');
        //     saveData();
        //     process.exit(0);
        // }
        ++retryCount;
    }
}


main();
