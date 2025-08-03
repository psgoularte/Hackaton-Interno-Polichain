const hre = require("hardhat");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // Verifica variáveis de ambiente
  if (!process.env.PLATFORM_ADDRESS) {
    throw new Error("PLATFORM_ADDRESS não definido no .env");
  }

  console.log("🚀 Iniciando deploy dos contratos...\n");

  // Deploy do Factory
  const AutoRaffleFactory = await hre.ethers.getContractFactory("AutoRaffleFactory");
  const factory = await AutoRaffleFactory.deploy(process.env.PLATFORM_ADDRESS);
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  // Atualiza o .env automaticamente
  updateEnvFile("FACTORY_ADDRESS", factoryAddress);

  console.log(`✅ AutoRaffleFactory deployed to: ${factoryAddress}`);
  
  // Gera arquivo de configuração para o frontend
  generateFrontendConfig(factoryAddress);
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  
  // Atualiza ou adiciona a variável
  if (envContent.includes(`${key}=`)) {
    envContent = envContent.replace(
      new RegExp(`${key}=.*`),
      `${key}=${value}`
    );
  } else {
    envContent += `\n${key}=${value}`;
  }

  fs.writeFileSync(envPath, envContent.trim());
  console.log(`✏️ .env atualizado: ${key}=${value}`);
}

function generateFrontendConfig(factoryAddress) {
  const configDir = path.join(__dirname, "../app/lib");
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  const configContent = `// Gerado automaticamente - ${new Date().toISOString()}
export const CONTRACT_ADDRESSES = {
  factory: "${factoryAddress}",
  platform: "${process.env.PLATFORM_ADDRESS}"
} as const;
`;

  const configPath = path.join(configDir, "contract-addresses.ts");
  fs.writeFileSync(configPath, configContent);
  console.log(`📁 Configuração do frontend gerada em: ${configPath}`);
}

main().catch(error => {
  console.error("❌ Erro no deploy:", error);
  process.exit(1);
});