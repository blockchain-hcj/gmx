import { ethers} from 'hardhat';
import {RewardRouterV2} from '../typechain/RewardRouterV2';
import {GlpManager} from '../typechain/GlpManager';
import {BigNumber} from "ethers";
import ContractAddress from "../deployment.json";
async function main() {
// 获取当前网络的提供者

  const provider = ethers.providers.Provider;
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [deployer] = await ethers.getSigners();
  const rewardRouter  = await ethers.getContractAt("RewardRouterV2","0xD745Daf1dF435fBeA88721Dd8B8A5036c7D4881b") as RewardRouterV2;
  const unstake = await rewardRouter.unstakeAndRedeemGlpETH("299100000000000000000",
    "990000000000000000", deployer.address);
  await unstake.wait();
  console.log(unstake.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
