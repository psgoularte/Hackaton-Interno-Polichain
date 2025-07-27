require("@nomicfoundation/hardhat-ethers");

/** @type import{'hardhat.config'}.HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
  },

  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },

  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
};
