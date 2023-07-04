import { ethers} from 'hardhat';
import {RewardRouterV2} from '../typechain/RewardRouterV2';
import {BigNumber} from "ethers";
import ContractAddress from "../deployment.json";
async function main() {
// 获取当前网络的提供者

  const provider = ethers.providers.Provider;
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [deployer] = await ethers.getSigners();
  const rewardRouter  = await ethers.getContractAt("RewardRouterV2","0xCc654f8077180DB66fF646f64ab1715AA0e54251") as RewardRouterV2;
  const mint = await rewardRouter.mintAndStakeGlpETH(ethers.utils.parseEther('299'),
    ethers.utils.parseEther('299'),{
    value: ethers.utils.parseEther('1')
    });
  await mint.wait();
  console.log(mint.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
