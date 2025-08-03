const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("AutoRaffleFactory");
  const factory = await Factory.deploy(
    "0x0fadE5b267b572dc1F002d1b9148976cCCE9C8C8"
  );

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress(); // <- aqui sim
  console.log("Factory deployed to:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
