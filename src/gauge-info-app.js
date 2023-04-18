task("gaugeInfo", "Voter.distributeFees").setAction(async () => {
    const cfg = await loadCfg();
    const Pair = await ethers.getContractFactory("contracts/Pair.sol:Pair")
    const Main = await ethers.getContractFactory("contracts/Voter.sol:Voter")
    const Gauge = await ethers.getContractFactory("contracts/Gauge.sol:Gauge")
    const main = Main.attach(cfg.Voter);
    const length = await main.length();
    let lines = [];
    for (let i = 0; i < length; ++i) {
        const poolAddress = await main.pools(i);
        const gaugeAddress = await main.gauges(poolAddress);
        const gauge = await Gauge.attach(gaugeAddress);
        const isAlive = await main.isAlive(gaugeAddress);
        const pool = await Pair.attach(poolAddress);
        const symbol = await pool.symbol();
        const fees = await pool.fees();
        const internal_bribe = await gauge.internal_bribe();
        const external_bribe = await gauge.external_bribe();
        lines.push('-----------------------------------------------------------')
        if( isAlive ) {
            lines.push(` - ${i}: Gauge: ${gaugeAddress} ${symbol}`);
        }else{
            lines.push(` - ${i}: Gauge: ${gaugeAddress} ${symbol} [DEAD]`);
        }
        lines.push(`     Pool: ${poolAddress}`);
        lines.push(`     Pair Fees: ${fees}`);
        lines.push(`     Internal Bribe: ${internal_bribe}`);
        lines.push(`     External Bribe: ${external_bribe}`);
    }
    const str = lines.join('\n');
    console.log(str);
    fs.writeFileSync('./gaugeInfo.txt', str);
});
