import { ethers} from 'hardhat';
import {StakedGlp} from '../typechain/StakedGlp';
import {BigNumber} from "ethers";
import ContractAddress from "../deployment.json";
import {RewardRouterV2, Token} from "../typechain";
async function main() {
// 获取当前网络的提供者

  const provider = new ethers.providers.JsonRpcProvider('https://arb-goerli.g.alchemy.com/v2/B3AjvdCFVaKh845e62PFl5uwLJsaU04k');
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [deployer] = await ethers.getSigners();
  console.log(await provider.getBalance(deployer.address));
  const eth  = await ethers.getContractAt("Token","0xBFD86Fb39fAcEC3C04C2ff1c0B35f8626DD5eafd") as Token;
  const rewardRouter  = await ethers.getContractAt("RewardRouterV2","0x2439a447F9631E5B5caD036D4b4e58e5A6D14065") as RewardRouterV2;
  const tx = await rewardRouter.handleRewards(true, // _shouldClaimGmx
    true, // _shouldStakeGmx
    true, // _shouldClaimEsGmx
    true, // _shouldStakeEsGmx
    true, // _shouldStakeMultiplierPoints
    true, // _shouldClaimWeth
    true);
  await tx.wait();
  console.log(tx.hash);

   console.log(await provider.getBalance(deployer.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
