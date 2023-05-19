'use strict';
const moment = require('moment')
const express = require('express')
const Web3 = require('web3');
require('dotenv').config({path: '.env'});
const web3_utils = new Web3(process.env.RPC);
const fs = require('fs');
const {_} = require('lodash');

process.on('uncaughtException', function (err) {
    console.error(err);
});

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

function getEpoch(blockInfo) {
    startBlockTimestamp = blockInfo.timestamp;
    const currentEpoch = parseInt(getEpochStart(startBlockTimestamp));
    // console.log(`old epoch: @${epochNumber} (${epoch})`)
    if (epoch !== currentEpoch) {
        epochNumber++;
        epoch = currentEpoch;
        console.log(`new epoch: @${epochNumber} (${epoch})`)
    }
}

function readOrCrateJsonFile(file, initialData) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, initialData);
    }
    return JSON.parse(fs.readFileSync(file).toString());
}

function loadData() {
    const r = readOrCrateJsonFile(`${process.env.DATA_DIR}/Config.json`,
        `{"startBlockNumber": 3708801, "epochNumber": 0, "epoch": 0}`);
    startBlockNumber = r.startBlockNumber;
    epochNumber = parseInt(r.epochNumber);
    epoch = parseInt(r.epoch);

    Deposit = readOrCrateJsonFile(`${process.env.DATA_DIR}/Deposit.json`, `[]`);
    Withdraw = readOrCrateJsonFile(`${process.env.DATA_DIR}/Withdraw.json`, `[]`);
    Transfer = readOrCrateJsonFile(`${process.env.DATA_DIR}/Transfer.json`, `[]`);
    allData = readOrCrateJsonFile(`${process.env.DATA_DIR}/allData.json`, `[]`);
    nftByAddress = readOrCrateJsonFile(`${process.env.DATA_DIR}/nftByAddress.json`, `{}`);
    POOL = readOrCrateJsonFile(`${process.env.DATA_DIR}/POOL.json`, `[]`);
}

async function saveData() {

    const r = {
        startBlockNumber: startBlockNumber,
        epochNumber: epochNumber,
        epoch: epoch
    };
    fs.writeFileSync(`${process.env.DATA_DIR}/Config.json`, JSON.stringify(r, undefined, '    '));
    fs.writeFileSync(`${process.env.DATA_DIR}/Deposit.json`, JSON.stringify(Deposit, undefined, '   '));
    fs.writeFileSync(`${process.env.DATA_DIR}/Withdraw.json`, JSON.stringify(Withdraw, undefined, '   '));
    fs.writeFileSync(`${process.env.DATA_DIR}/Transfer.json`, JSON.stringify(Transfer, undefined, '   '));
    fs.writeFileSync(`${process.env.DATA_DIR}/nftByAddress.json`, JSON.stringify(nftByAddress, undefined, '   '));
    fs.writeFileSync(`${process.env.DATA_DIR}/allData.json`, JSON.stringify(allData, undefined, '   '));
    fs.writeFileSync(`${process.env.DATA_DIR}/POOL.json`, JSON.stringify(POOL, undefined, '   '));

}

function computeVeVARA(amount, locktime, ts) {
    amount = parseFloat(amount);
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    const days = parseInt((locktime - ts) / DAY);
    return parseFloat(FACTOR * days * amount);
}


function getVeStats(value, locktime, ts) {
    locktime = parseInt(locktime);
    ts = parseInt(ts);
    let amount = parseFloat(web3_utils.utils.fromWei(value));
    const ve = computeVeVARA(amount, parseInt(locktime), parseInt(ts));
    const days = parseInt((locktime - ts) / DAY);
    const date = new Date(ts * 1000).toISOString();
    return {amount, ve, days, date};
}

async function saveDeposit(votingEscrow, e, blockInfo, provider, tokenId, value, locktime, deposit_type, ts) {
    deposit_type = parseInt(deposit_type);
    let type = 'DEPOSIT';
    if (deposit_type === 1) type = 'CREATE_LOCK';
    if (deposit_type === 2) type = 'INCREASE_LOCK_AMOUNT';
    if (deposit_type === 3) type = 'INCREASE_UNLOCK_TIME';
    if (deposit_type === 4) type = 'MERGE_TYPE';
    if (!locktime || parseInt(locktime) === 0) {
        const LockedBalanceAtBlock = await votingEscrow.methods.locked(tokenId).call(undefined, e.blockNumber);
        locktime = LockedBalanceAtBlock.end;
    }

    const {amount, ve, days, date} = getVeStats(value, locktime, ts);
    console.log(`\t@${epochNumber} Deposit ${type}: ${provider} ${amount} ve=${ve}, days=${days}`);
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
    const amount = parseFloat(web3_utils.utils.fromWei(value));
    console.log(`\t@${epochNumber} Withdraw: ${provider} ${amount} #${tokenId}`);
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

async function saveTransfer(e, blockInfo, from, to, tokenId) {
    let type;
    if (!nftByAddress[from]) nftByAddress[from] = [];
    if (!nftByAddress[to]) nftByAddress[to] = [];
    if (from === '0x0000000000000000000000000000000000000000') {
        type = 'Mint';
        console.log(`\t@${epochNumber} ${type}: ${to} #${tokenId}`);
        nftByAddress[to].push(tokenId);
    } else if (to === '0x0000000000000000000000000000000000000000') {
        type = 'Burn';
        console.log(`\t@${epochNumber} ${type}: ${from} #${tokenId}`);
        nftByAddress[from].splice(nftByAddress[from].indexOf(tokenId), 1);
    } else {
        type = 'Transfer';
        nftByAddress[from].splice(nftByAddress[from].indexOf(tokenId));
        nftByAddress[to].push(tokenId);
        console.log(`\t@${epochNumber} ${type}: ${from}->${to} #${tokenId}`);
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

async function getPastEvents(args) {
    try {
        const web3 = new Web3(process.env.RPC);
        const votingEscrow = new web3.eth.Contract(abiVe, veAddress);
        const events = await votingEscrow.getPastEvents(args);
        for (let j = 0; j < events.length; j++) {
            const e = events[j];
            if (!e.event) continue;
            const txid = `${e.transactionHash}-${j}`;
            if (POOL.indexOf(txid) !== -1) {
                console.log(`FOUND: TX=${txid} blockNumber=${e.blockNumber}`, args);
                continue;
            }
            POOL.push(txid);
            const u = e.returnValues;
            if (e.event === 'Deposit') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                // console.log('e', e);
                // console.log('blockInfo', blockInfo);
                allData.push({
                    epoch: epoch,
                    tx: e.transactionHash,
                    block: e.blockNumber,
                    event: e.event,
                    returnValues: e.returnValues
                });
                await saveDeposit(votingEscrow, e, blockInfo, u.provider, u.tokenId, u.value, u.locktime, u.deposit_type, u.ts);
            } else if (e.event === 'Withdraw') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                allData.push({
                    epoch: epoch,
                    tx: e.transactionHash,
                    block: e.blockNumber,
                    event: e.event,
                    returnValues: e.returnValues
                });
                await saveWithdraw(e, blockInfo, u.provider, u.tokenId, u.value);
            } else if (e.event === 'Transfer') {
                const blockInfo = await web3.eth.getBlock(e.blockNumber);
                getEpoch(blockInfo);
                allData.push({
                    epoch: epoch,
                    tx: e.transactionHash,
                    block: e.blockNumber,
                    event: e.event,
                    returnValues: e.returnValues
                });
                await saveTransfer(e, blockInfo, u.from, u.to, u.tokenId);
            }
        }
        return true;
    } catch (e) {
        console.log('getPastEvents', args, e.toString());
        return false;
    }
}

let processEventRetryCount = 0, processEventRetryLastEvent = 0;

async function processEvents() {
    //await new Promise(resolve => setTimeout(resolve, 1000));
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
    let web3 = new Web3(process.env.RPC);
    let size = 1000
    const blocks = startBlockNumber + size;
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
    for (let i = startBlockNumber; i < endBlockNumber; i += size) {
        let args = {fromBlock: i, toBlock: i + size - 1};
        if (args.toBlock > endBlockNumber) {
            console.log(`@${epochNumber} getPastEvents`, args, ` resize: ${args.toBlock}->${endBlockNumber}`);
            args.toBlock = endBlockNumber;
        } else {
            console.log(`@${epochNumber} getPastEvents`, args, ` latest.number=${latest.number}`);
        }

        let retryCount = 0;
        while (await getPastEvents(args) !== true) {
            web3 = new Web3(process.env.RPC);
            console.log(`\t@${epochNumber} getPastEvents error retrying in 10s...`, args);
            await new Promise(resolve => setTimeout(resolve, 10000));
            ++retryCount;
        }
        const pendingBlocks = endBlockNumber - startBlockNumber;
        // compute the pending blocks percentage left to finish this loop:
        const pendingBlocksPercent = Math.round((pendingBlocks / (endBlockNumber - args.fromBlock)) * 100);
        console.log(`@${epochNumber} retry=${retryCount} pendingBlocks=${pendingBlocks} epochNumber=${epochNumber} (${pendingBlocksPercent}%)`);
        startBlockNumber = args.toBlock;
        await saveData();
    }

    running = false;
}

async function main() {
    const app = express()
    const port = process.env.HTTP_PORT

    app.get('/', async (req, res) => {
        res.json(await getInfo());
    })

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
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json(Deposit.filter((r) => {
            return r.epochNumber === argEpoch
        }));
    })
    app.get('/api/v1/withdraw/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json(Withdraw.filter((r) => {
            return r.epochNumber === argEpoch
        }));
    })

    app.get('/api/v1/transfer/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json(Transfer.filter((r) => {
            return r.epochNumber === argEpoch
        }));
    })

    app.get('/api/v1/all/:epoch', (req, res) => {
        const argEpoch = parseInt(req.params.epoch > 0 ? req.params.epoch : epochNumber);
        res.json(allData.filter((r) => {
            return r.epochNumber === argEpoch
        }));
    })

    app.get('/api/v1/nftByAddress/:address', (req, res) => {
        const address = req.params.address;
        res.json(nftByAddress[address] ? nftByAddress[address] : []);
    })

    app.get('/api/v1/allHoldersBalance', async (req, res) => {
        let sortBy = req.query.sortBy ? req.query.sortBy : 'tokenId';
        let orderBy = req.query.orderBy ? req.query.orderBy : 'asc';
        res.json(_.orderBy(holderInfo, byKey(sortBy), [orderBy]));
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
        res.json(Gauges);
    })


    app.listen(port, () => {
        console.log(`- HTTP ${port}`)
    })

    console.log(`- RPC: ${process.env.RPC}`);

    loadData();
    exec_gauge_info();
    exec_holder_info();
    setInterval(exec_holder_info, ONE_MINUTE);
    setInterval(exec_gauge_info, ONE_HOUR);
    processEvents();
    setInterval(processEvents, ONE_MINUTE);
}

async function getInfo() {
    await new Promise(resolve => setTimeout(resolve, 1000));
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

function byKey(key) {
    return function (o) {
        const v = parseInt(o[key], 10);
        return isNaN(v) ? o[key] : v;
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
    const web3 = new Web3(process.env.RPC);
    const votingEscrow = new web3.eth.Contract(abiVe, veAddress);
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
        const web3 = new Web3(process.env.RPC);
        const multicall = new web3.eth.Contract(abiMulticall, multicallAddress);
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    const web3 = new Web3(process.env.RPC);
    const voter = new web3.eth.Contract(abiVoter, voterAddress);

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
