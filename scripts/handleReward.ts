import { ethers} from 'hardhat';
import {StakedGlp} from '../typechain/StakedGlp';
import {BigNumber} from "ethers";
import ContractAddress from "../deployment.json";
import {RewardRouterV2, Token} from "../typechain";
async function main() {
// 获取当前网络的提供者

  const provider = ethers.providers.Provider;
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [deployer] = await ethers.getSigners();
  const eth = await ethers.getContractAt("Token", "0x90Aa4B146B3550a7eB526fBACdd42CDC57Ca9590") as Token;
  console.log(await eth.balanceOf(deployer.address));
  const rewardRouter  = await ethers.getContractAt("RewardRouterV2","0xCc654f8077180DB66fF646f64ab1715AA0e54251") as RewardRouterV2;
  const tx = await rewardRouter.handleRewards(true, // _shouldClaimGmx
    true, // _shouldStakeGmx
    true, // _shouldClaimEsGmx
    true, // _shouldStakeEsGmx
    true, // _shouldStakeMultiplierPoints
    true, // _shouldClaimWeth
    false);
  await tx.wait();
  console.log(tx.hash);
  console.log(await eth.balanceOf(deployer.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
