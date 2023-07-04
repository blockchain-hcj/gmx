import {Contract} from "ethers";
import {ethers} from "hardhat";
import {writeFileSync} from "fs";

interface IDeploymentHistory {
  address: string
}

export class DeploymentHelper {
   deploymentState: { [id: string]: IDeploymentHistory } = {}
  async deployContract(name, args, label?, options?): Promise<Contract> {
    if (!options && typeof label === "object") {
      label = null
      options = label
    }

    let info = name
    if (label) { info = name + ":" + label }
    const contractFactory = await ethers.getContractFactory(name)
    let contract
    if (options) {
      contract = await contractFactory.deploy(...args, options)
    } else {
      contract = await contractFactory.deploy(...args)
    }
    const argStr = args.map((i) => `"${i}"`).join(" ")
    await contract.deployTransaction.wait()
    this.deploymentState[info] = {
      address: contract.address
    }
    this.saveDeployment();
    return contract
  }

  private saveDeployment() {
    const deploymentStateJson = JSON.stringify(
      this.deploymentState,
      null,
      2
    )
    writeFileSync( './deployment.json', deploymentStateJson)
  }
}
