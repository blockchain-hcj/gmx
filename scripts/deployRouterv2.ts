// @ts-ignore
import { ethers} from 'hardhat';
import { deployContract} from './shared/helpers'
import {expandDecimals} from '../test/shared/utilities'
import {toChainlinkPrice} from '../test/shared/chainlink'
import {getBnbConfig, getDaiConfig,getBtcConfig,getEthConfig} from '../test/core/Vault/helpers'
import {initVault} from '../test/core/Vault/helpers'
import {DeploymentHelper} from "./deploymentHelper";
import {RewardDistributor, Token} from "../typechain";


async function main() {


// 获取当前网络的提供者
  const provider = ethers.providers.Provider;
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [wallet] = await ethers.getSigners();
  const helper =  new DeploymentHelper()
  const vestingDuration = 365 * 24 * 60 * 60


  let vault
  let glpManager
  let glp
  let usdg
  let router
  let vaultPriceFeed
  let bnb
  let bnbPriceFeed
  let btc
  let btcPriceFeed
  let eth
  let ethPriceFeed
  let dai
  let daiPriceFeed
  let busd
  let busdPriceFeed

  let gmx
  let esGmx
  let bnGmx

  let stakedGmxTracker
  let stakedGmxDistributor
  let bonusGmxTracker
  let bonusGmxDistributor
  let feeGmxTracker
  let feeGmxDistributor

  let feeGlpTracker
  let feeGlpDistributor
  let stakedGlpTracker
  let stakedGlpDistributor

  let gmxVester
  let glpVester
let sglp
  let rewardRouter

    bnb = await helper.deployContract("Token", [], "bnb")
    bnbPriceFeed = await helper.deployContract("PriceFeed", [],"bnbPriceFeed")

    btc = await helper.deployContract("Token", [], "btc")
    btcPriceFeed = await helper.deployContract("PriceFeed", [], "btcPriceFeed")

  eth = await helper.deployContract("Token", [], "eth")

  ethPriceFeed = await helper.deployContract("PriceFeed", [], "ethPriceFeed")

  dai = await helper.deployContract("Token", [], "dai")

  daiPriceFeed = await helper.deployContract("PriceFeed", [], "daiPriceFeed")


    vault = await helper.deployContract("Vault", [])
    usdg = await helper.deployContract("USDG", [vault.address])

  router = await helper.deployContract("Router", [vault.address, usdg.address, eth.address])

  vaultPriceFeed = await helper.deployContract("VaultPriceFeed", [])

  glp = await helper.deployContract("GLP", [])
  await initVault(vault, router, usdg, vaultPriceFeed)
  glpManager = await helper.deployContract("GlpManager", [vault.address, usdg.address, glp.address, ethers.constants.AddressZero, 0])


    let tx = await vaultPriceFeed.setTokenConfig(bnb.address, bnbPriceFeed.address, 8, false)
    await tx.wait();
    tx = await vaultPriceFeed.setTokenConfig(btc.address, btcPriceFeed.address, 8, false)
    await tx.wait();
    tx = await vaultPriceFeed.setTokenConfig(eth.address, ethPriceFeed.address, 8, false)
    await tx.wait();
    tx =  await vaultPriceFeed.setTokenConfig(dai.address, daiPriceFeed.address, 8, false)
    await tx.wait();


  tx = await daiPriceFeed.setLatestAnswer(toChainlinkPrice(1))
  await tx.wait();
  tx =  await vault.setTokenConfig(...getDaiConfig(dai, daiPriceFeed))
  await tx.wait();
  tx =  await btcPriceFeed.setLatestAnswer(toChainlinkPrice(60000))
  await tx.wait();
  tx =   await vault.setTokenConfig(...getBtcConfig(btc, btcPriceFeed))
  await tx.wait();


  tx = await bnbPriceFeed.setLatestAnswer(toChainlinkPrice(300))
  await tx.wait();
  tx =  await vault.setTokenConfig(...getBnbConfig(bnb, bnbPriceFeed))
  await tx.wait();

  tx = await ethPriceFeed.setLatestAnswer(toChainlinkPrice(300))
  await tx.wait();
  tx =  await vault.setTokenConfig(...getEthConfig(eth, ethPriceFeed))
  await tx.wait();

  tx =   await glp.setMinter(glpManager.address, true)
  await tx.wait();

  gmx = await helper.deployContract("GMX", []);
  esGmx = await helper.deployContract("EsGMX", []);

  bnGmx = await helper.deployContract("MintableBaseToken", ["Bonus GMX", "bnGMX", 0]);


  // GMX
    stakedGmxTracker = await helper.deployContract("RewardTracker", ["Staked GMX", "sGMX"], "stakedGmxTracker")
  stakedGmxDistributor = await helper.deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address],"stakedGmxDistributor")
  tx = await stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address)
  await tx.wait()
  tx = await stakedGmxDistributor.updateLastDistributionTime()
  await tx.wait()

  bonusGmxTracker = await helper.deployContract("RewardTracker", ["Staked + Bonus GMX", "sbGMX"],"bonusGmxTracker")
  bonusGmxDistributor = await helper.deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address], "bonusGmxDistributor")
  tx =  await bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address)
  await tx.wait()
  tx = await bonusGmxDistributor.updateLastDistributionTime()
  await tx.wait()

  feeGmxTracker = await helper.deployContract("RewardTracker", ["Staked + Bonus + Fee GMX", "sbfGMX"],"feeGmxTracker")
  feeGmxDistributor = await helper.deployContract("RewardDistributor", [eth.address, feeGmxTracker.address],"feeGmxDistributor")
  tx =  await feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address)
  await tx.wait();
  tx =  await feeGmxDistributor.updateLastDistributionTime()
  await tx.wait();

    // GLP
  feeGlpTracker = await helper.deployContract("RewardTracker", ["Fee GLP", "fGLP"],"feeGlpTracker")
  feeGlpDistributor = await helper.deployContract("RewardDistributor", [eth.address, feeGlpTracker.address],"feeGlpDistributor")
  tx =  await feeGlpTracker.initialize([glp.address], feeGlpDistributor.address)
  await tx.wait();
  tx =  await feeGlpDistributor.updateLastDistributionTime()
  await tx.wait();

  stakedGlpTracker = await helper.deployContract("RewardTracker", ["Fee + Staked GLP", "fsGLP"],"stakedGlpTracker")
  stakedGlpDistributor = await helper.deployContract("RewardDistributor", [esGmx.address, stakedGlpTracker.address],"stakedGlpDistributor")
  tx =  await stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address)
  await tx.wait();
  tx =  await stakedGlpDistributor.updateLastDistributionTime()
  await tx.wait();

  sglp = await helper.deployContract("StakedGlp", [glp.address,glpManager.address,stakedGlpTracker.address, feeGlpTracker.address] );

  gmxVester = await helper.deployContract("Vester", [
      "Vested GMX", // _name
      "vGMX", // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      feeGmxTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedGmxTracker.address, // _rewardTracker
    ],"gmxVester")

    glpVester = await helper.deployContract("Vester", [
      "Vested GLP", // _name
      "vGLP", // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      stakedGlpTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedGlpTracker.address, // _rewardTracker
    ], "glpVester")


  rewardRouter = await helper.deployContract("RewardRouterV2", [])
  await rewardRouter.initialize(
      eth.address,
      gmx.address,
      esGmx.address,
      bnGmx.address,
      glp.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      feeGlpTracker.address,
      stakedGlpTracker.address,
      glpManager.address,
      gmxVester.address,
      glpVester.address
    )

    // allow bonusGmxTracker to stake stakedGmxTracker
  tx = await stakedGmxTracker.setHandler(bonusGmxTracker.address, true)
  await tx.wait()
    // allow bonusGmxTracker to stake feeGmxTracker
  tx = await bonusGmxTracker.setHandler(feeGmxTracker.address, true)
  await tx.wait()

  tx =await bonusGmxDistributor.setBonusMultiplier(10000)
  await tx.wait()

  // allow feeGmxTracker to stake bnGmx
  tx = await bnGmx.setHandler(feeGmxTracker.address, true)
  await tx.wait()


  // allow stakedGlpTracker to stake feeGlpTracker
  tx = await feeGlpTracker.setHandler(stakedGlpTracker.address, true)
  await tx.wait()

  // allow feeGlpTracker to stake glp
  tx = await glp.setHandler(feeGlpTracker.address, true)
  await tx.wait()


  // mint esGmx for distributors
  tx =await esGmx.setMinter(wallet.address, true)
  await tx.wait()

  tx = await esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000, 18))
  await tx.wait()

  tx = await stakedGmxDistributor.setTokensPerInterval("20667989410000000") // 0.02066798941 esGmx per second
  await tx.wait()

  tx = await esGmx.mint(stakedGlpDistributor.address, expandDecimals(50000, 18))
  await tx.wait()

  tx =  await stakedGlpDistributor.setTokensPerInterval("20667989410000000") // 0.02066798941 esGmx per second
  await tx.wait()


  // mint bnGmx for distributor
  tx =  await bnGmx.setMinter(wallet.address, true)
  await tx.wait()

  tx =  await bnGmx.mint(bonusGmxDistributor.address, expandDecimals(1500, 18))
  await tx.wait()


//    await esGmx.setHandler(tokenManager.address, true)
  tx = await gmxVester.setHandler(wallet.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(stakedGmxDistributor.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(stakedGlpDistributor.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(stakedGmxTracker.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(stakedGlpTracker.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(gmxVester.address, true)
  await tx.wait()

  tx = await esGmx.setHandler(glpVester.address, true)
  await tx.wait()


  tx = await glpManager.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await stakedGmxTracker.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await bonusGmxTracker.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx =  await feeGmxTracker.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await feeGlpTracker.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await stakedGlpTracker.setHandler(rewardRouter.address, true)
  await tx.wait()

  tx = await feeGlpTracker.setHandler(sglp.address, true)
  await tx.wait()

  tx = await stakedGlpTracker.setHandler(sglp.address, true)
  await tx.wait()


  tx =  await esGmx.setHandler(rewardRouter.address, true)
  await tx.wait()
  tx =  await bnGmx.setMinter(rewardRouter.address, true)
  await tx.wait()
  tx =  await esGmx.setMinter(gmxVester.address, true)
  await tx.wait()
  tx = await esGmx.setMinter(glpVester.address, true)
  await tx.wait()
  tx =await gmxVester.setHandler(rewardRouter.address, true)
  await tx.wait()
  tx =await glpVester.setHandler(rewardRouter.address, true)
  await tx.wait()
  tx =await feeGmxTracker.setHandler(gmxVester.address, true)
  await tx.wait()
  tx =await stakedGlpTracker.setHandler(glpVester.address, true)
  await tx.wait()

  tx = await eth.deposit({
    value: ethers.utils.parseEther('0.1')
  })
  await tx.wait();
   tx = await eth.mint(feeGlpDistributor.address, ethers.utils.parseEther('500'))
  await tx.wait();
  tx = await feeGlpDistributor.setTokensPerInterval("41335970000000");
  await tx.wait();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
