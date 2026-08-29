import hre from "hardhat";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
  const registry = await hre.viem.deployContract("TradeTwinRegistry");
  const address = registry.address;

  console.log("TradeTwinRegistry deployed to:", address);

  const outPath = resolve(__dirname, "../src/config/deployed-registry.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        address,
        chainId: 10143,
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log("Wrote address to src/config/deployed-registry.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
