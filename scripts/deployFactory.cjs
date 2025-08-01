const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos...\n");

  // 1. Deploy do AutoRaffleFactory
  console.log("1. Fazendo deploy do AutoRaffleFactory...");
  const platformAddress = "0x0fadE5b267b572dc1F002d1b9148976cCCE9C8C8"; // Substitua pelo endereço real

  const AutoRaffleFactory = await hre.ethers.getContractFactory(
    "AutoRaffleFactory"
  );
  const factory = await AutoRaffleFactory.deploy(platformAddress);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ AutoRaffleFactory deployed to: ${factoryAddress}`);
  console.log(`   Platform address: ${platformAddress}`);

  // 3. Gera arquivo de configuração com os endereços
  console.log("\n3. Gerando arquivo de configuração...");

  const configContent = `// Endereços dos contratos deployados - ${new Date().toISOString()}
export const AUTORAFFLE_FACTORY_ADDRESS = "${factoryAddress}";
`;

  // Cria o diretório se não existir
  const configDir = path.join(__dirname, "../app/lib");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configPath = path.join(configDir, "deployed-contracts.ts");
  fs.writeFileSync(configPath, configContent);

  console.log(`✅ Configuração salva em: ${configPath}`);
  console.log("\n🎉 Deploy concluído com sucesso!");
}

main().catch((error) => {
  console.error("❌ Erro durante o deploy:", error);
  process.exitCode = 1;
});
