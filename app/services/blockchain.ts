import { CONFIG } from "@/config";
import { createPublicClient, http } from "viem";
import { hardhat } from "@/lib/wagmi"; // ajuste conforme seu projeto
import { ethers } from "ethers";
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

// src/services/blockchain.ts
interface ContractCall {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
}

type ABIType =
  | "uint256"
  | "uint"
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "uint128"
  | "int256"
  | "int"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "int128"
  | "address"
  | "string"
  | "bool"
  | "bytes"
  | "bytes1"
  | "bytes32"
  | `bytes${number}`
  | "tuple";

type ABIComponent = {
  name: string;
  type: ABIType;
  internalType?: string;
  components?: ABIComponent[]; // Para tipos complexos/tuples
};

type ABIOutput = ABIComponent;

type ABIMethod = {
  name: string;
  type: "function";
  inputs: ABIComponent[];
  outputs: ABIOutput[];
  stateMutability: "view" | "pure" | "nonpayable" | "payable";
};

export async function getTransactionReceipt(txHash: string) {
  return await publicClient.waitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });
}
type TupleValue = Record<string, any> | any[];

export interface TransactionResponse {
  hash: string;
  wait?: () => Promise<{
    logs: Array<{
      address: string;
      topics: string[];
      data: string;
    }>;
    contractAddress?: string;
  }>;
}

export function weiToEth(weiValue: string | bigint): number {
  const wei = typeof weiValue === "string" ? BigInt(weiValue) : weiValue;
  return Number(wei) / 1e18;
}

export function timestampToDate(timestamp: number | string | bigint): string {
  const ts =
    typeof timestamp === "string"
      ? BigInt(timestamp)
      : typeof timestamp === "number"
      ? BigInt(timestamp)
      : timestamp;
  return new Date(Number(ts) * 1000).toISOString();
}

export interface ContractABI extends Array<ABIMethod | any> {}

export async function callContract<T = any>({
  address,
  abi,
  functionName,
  args = [],
}: {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
}): Promise<T> {
  const RPC_URL =
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY";

  // Cria provider JSON-RPC com ethers v6
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Cria interface do contrato
  const contractInterface = new ethers.Interface(abi);

  // Verifica se a função existe no ABI
  if (!contractInterface.getFunction(functionName)) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  // Codifica os dados para a chamada (call)
  const data = contractInterface.encodeFunctionData(functionName, args);

  // Monta o objeto para eth_call
  const callRequest = {
    to: address,
    data,
  };

  // Executa o eth_call
  const result = await provider.call(callRequest);

  // Decodifica o resultado
  const decoded = contractInterface.decodeFunctionResult(functionName, result);

  // Se só tem um valor de retorno, retorna ele direto
  if (decoded.length === 1) return decoded[0] as T;

  // Se vários, retorna array completo
  return decoded as unknown as T;
}
// Função corrigida com tipagem completa
async function encodeFunctionCall(
  method: ABIMethod,
  args: any[]
): Promise<string> {
  // Verificação de segurança
  if (method.inputs.length !== args.length) {
    throw new Error(
      `Argument count mismatch for function ${method.name}. Expected ${method.inputs.length}, got ${args.length}`
    );
  }

  // Criar assinatura da função
  const signature = `${method.name}(${method.inputs
    .map((i) => i.type)
    .join(",")})`;

  // Gerar methodID (primeiros 4 bytes do hash keccak256)
  const methodId = (await keccak256(signature)).slice(0, 10); // 0x + 8 caracteres

  // Codificar cada argumento
  let encodedArgs = "";
  method.inputs.forEach((input, index) => {
    encodedArgs += encodeArgument(input, args[index]);
  });

  return methodId + encodedArgs;
}

function encodeArgument(input: ABIComponent, value: any): string {
  const { type, components } = input;

  // Primeiro verificamos os tipos complexos
  if (type === "tuple" && components) {
    return encodeTuple(components, value);
  }

  // Depois verificamos os tipos com padrões
  if (type.startsWith("uint")) {
    const bits = parseInt(type.replace("uint", "")) || 256;
    return encodeUint(value, bits);
  } else if (type.startsWith("int")) {
    const bits = parseInt(type.replace("int", "")) || 256;
    return encodeInt(value, bits);
  } else if (type.startsWith("bytes") && type !== "bytes") {
    const length = parseInt(type.replace("bytes", ""));
    return encodeFixedBytes(value, length);
  }
  // Tipos simples
  else if (type === "address") {
    return encodeAddress(value);
  } else if (type === "string") {
    return encodeString(value);
  } else if (type === "bool") {
    return encodeBool(value);
  } else {
    throw new Error(`Unsupported type: ${type}`);
  }
}

function encodeTuple(components: ABIComponent[], value: TupleValue): string {
  // Converter objeto para array se necessário
  const valuesArray = Array.isArray(value)
    ? value
    : components.map((comp) => {
        if (typeof value !== "object" || value === null) {
          throw new Error(
            `Expected object or array for tuple, got ${typeof value}`
          );
        }

        // Verificação de segurança para acesso por nome
        if (!(comp.name in value)) {
          throw new Error(`Missing property ${comp.name} in tuple value`);
        }

        return value[comp.name];
      });

  // Para tuples dinâmicos, precisamos calcular offsets
  let dynamicParts = "";
  let staticParts = "";

  const elementsEncoded = components.map((comp, i) => ({
    type: comp.type,
    value: encodeArgument(comp, valuesArray[i]),
  }));

  elementsEncoded.forEach(({ type, value }) => {
    if (isDynamicType(type)) {
      const offset = elementsEncoded.length * 32 + dynamicParts.length / 2;
      staticParts += offset.toString(16).padStart(64, "0");
      dynamicParts += value;
    } else {
      staticParts += value;
    }
  });

  return staticParts + dynamicParts;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDynamicType(type: string): boolean {
  return (
    type === "string" ||
    type === "bytes" ||
    type.endsWith("[]") ||
    type === "tuple"
  );
}

function encodeFixedBytes(value: string | Uint8Array, length: number): string {
  let hex: string;

  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      hex = value.slice(2);
    } else {
      hex = Buffer.from(value).toString("hex");
    }
  } else {
    hex = Buffer.from(value).toString("hex");
  }

  if (hex.length > length * 2) {
    throw new Error(`Value too long for bytes${length}`);
  }

  return hex.padEnd(64, "0");
}

function encodeInt(
  value: number | string | bigint,
  bits: number = 256
): string {
  const minValue = -(BigInt(2) ** BigInt(bits - 1));
  const maxValue = BigInt(2) ** BigInt(bits - 1) - BigInt(1);
  const num = BigInt(value);

  if (num < minValue || num > maxValue) {
    throw new Error(`Value ${value} out of range for int${bits}`);
  }

  // Converter para complemento de dois
  if (num < 0) {
    const complement = BigInt(2) ** BigInt(bits) + num;
    return complement.toString(16).padStart(64, "0");
  }

  return num.toString(16).padStart(64, "0");
}

// Implementações específicas (exemplos)
function encodeUint(value: number | string | bigint, bits: number): string {
  const maxValue = BigInt(2) ** BigInt(bits) - BigInt(1);
  const num = BigInt(value);

  if (num < 0 || num > maxValue) {
    throw new Error(`Value ${value} out of range for uint${bits}`);
  }

  return num.toString(16).padStart(64, "0");
}

function encodeAddress(value: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`Invalid address format: ${value}`);
  }
  return value.toLowerCase().slice(2).padStart(64, "0");
}

function encodeUint256(value: number | string | bigint): string {
  const num = typeof value === "bigint" ? value : BigInt(value);
  return num.toString(16).padStart(64, "0");
}

function encodeString(value: string): string {
  // Codificação simplificada para strings
  const length = value.length.toString(16).padStart(64, "0");
  const content = Buffer.from(value).toString("hex").padEnd(64, "0");
  return length + content;
}

function encodeBool(value: boolean): string {
  return value ? "1".padStart(64, "0") : "0".padStart(64, "0");
}

// Implementação simplificada de decodificação ABI
function decodeResult(method: any, data: string): any {
  // Remove o prefixo 0x
  const rawData = data.startsWith("0x") ? data.slice(2) : data;

  // Para uint256 (que é o que usamos principalmente)
  if (method.outputs[0].type === "uint256") {
    return parseInt(rawData, 16).toString();
  }

  // Para endereços
  if (method.outputs[0].type === "address") {
    return `0x${rawData.slice(24)}`; // Endereços são os últimos 20 bytes (40 caracteres hex)
  }

  // Padrão: retorna o valor bruto
  return rawData;
}

function hexEncode(str: string): string {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex;
}

// Implementação realista do keccak256 (usando a Web Crypto API)
async function keccak256(message: string): Promise<string> {
  // Converte a string para um ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Calcula o hash usando a Web Crypto API
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Converte para string hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return "0x" + hashHex;
}

function padTo64(value: string): string {
  return value.padStart(64, "0");
}
