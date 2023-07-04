import { ethers} from 'hardhat';
import {StakedGlp} from '../typechain/StakedGlp';
import {BigNumber} from "ethers";
import ContractAddress from "../deployment.json";
async function main() {
// 获取当前网络的提供者

  const provider = ethers.providers.Provider;
  const gasPrice = await ethers.provider.getGasPrice()
// 获取部署者的钱包
  const [deployer] = await ethers.getSigners();
  const Gp = await ethers.getContractAt("StakedGlp","0x722bf6996C8e3802C8E4CCB66D8024A9087cF650" ) as StakedGlp;
  console.log(await Gp.balanceOf(deployer.address))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
