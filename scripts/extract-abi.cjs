// scripts/extract-abi.cjs
const fs = require("fs");
const path = require("path");

// Configuração dos contratos
const CONTRACTS_CONFIG = [
  {
    name: "RaffleManager",
    artifact: "../artifacts/contracts/RaffleManager.sol/RaffleManager.json",
  },
  // Adicione outros contratos aqui se necessário
];

async function generateContractsFile() {
  let fileContent = `// Arquivo gerado automaticamente - não edite manualmente
// Data: ${new Date().toISOString()}\n\n`;

  // Processa cada contrato
  for (const contract of CONTRACTS_CONFIG) {
    try {
      const artifactPath = path.join(__dirname, contract.artifact);
      const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      fileContent += `export const ${contract.name}ABI = ${JSON.stringify(
        abi,
        null,
        2
      )} as const;\n`;
      fileContent += `export const ${contract.name.toUpperCase()}_ADDRESS = "${
        contract.name
      }Address" as const;\n\n`;
    } catch (error) {
      console.error(`Erro ao processar ${contract.name}:`, error.message);
      process.exit(1);
    }
  }

  // Adiciona exportação consolidada
  fileContent += `// Objeto consolidado para fácil importação\nexport const CONTRACTS = {\n`;
  fileContent += CONTRACTS_CONFIG.map(
    (c) =>
      `  ${c.name}: {\n    abi: ${
        c.name
      }ABI,\n    address: ${c.name.toUpperCase()}_ADDRESS\n  }`
  ).join(",\n");
  fileContent += `\n} as const;\n`;

  // Cria diretório se não existir
  const outputDir = path.join(__dirname, "../app/lib");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Escreve o arquivo
  const outputPath = path.join(outputDir, "contracts.ts");
  fs.writeFileSync(outputPath, fileContent);

  console.log(`✅ Arquivo gerado em: ${outputPath}`);
  console.log("⚠️ Atualize os endereços dos contratos após o deploy");
}

generateContractsFile().catch(console.error);
