// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  console.log("Fazendo deploy de RaffleManager");
  // Deploy GuitarCards
  const GuitarCards = await hre.ethers.getContractFactory("RaffleManager");
  const guitarCards = await GuitarCards.deploy();
  console.log(`RaffleManager deployed to: ${await guitarCards.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
