import { createRequire } from "module";
// Quick test - dynamic import won't work for ts. Use compiled approach.

const address = "0x9c7EC5B79c27Be88ABB98815246A48E125c6675c";

async function findFirstFundedBlock(publicClient, checksummed) {
  const latest = await publicClient.getBlockNumber();
  const current = await publicClient.getBalance({ address: checksummed });
  if (current === 0n) return null;
  let low = 0n, high = latest;
  for (let i = 0; i < 32 && low < high; i++) {
    const mid = (low + high) / 2n;
    const bal = await publicClient.getBalance({ address: checksummed, blockNumber: mid });
    if (bal > 0n) high = mid; else low = mid + 1n;
  }
  return low;
}

const { createPublicClient, http } = await import("viem");
const { defineChain } = await import("viem");

const monad = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz/"] } },
});

const client = createPublicClient({ chain: monad, transport: http() });
const addr = address;
const first = await findFirstFundedBlock(client, addr);
const latest = await client.getBlockNumber();
const bal = await client.getBalance({ address: addr });
console.log("balance MON", Number(bal) / 1e18);
console.log("first funded block", first?.toString());
console.log("latest block", latest.toString());

if (first) {
  const end = first + 500n > latest ? latest : first + 500n;
  let count = 0;
  for (let bn = first; bn <= end; bn++) {
    const block = await client.getBlock({ blockNumber: bn, includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      const to = tx.to?.toLowerCase();
      const from = tx.from.toLowerCase();
      if (to === addr.toLowerCase() || from === addr.toLowerCase()) {
        count++;
        if (count <= 3) console.log("tx", tx.hash, from === addr.toLowerCase() ? "out" : "in", Number(tx.value)/1e18);
      }
    }
  }
  console.log("transfers found in range", count);
}
