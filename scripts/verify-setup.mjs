/**
 * Quick local verification — run: npm run verify
 */
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const WALLET = "0x9c7EC5B79c27Be88ABB98815246A48E125c6675c";

async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`✓ ${name}: ${detail}`);
    return true;
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`TradeTwin verify → ${BASE}\n`);

  const results = [];

  results.push(
    await check("Health", async () => {
      const res = await fetch(`${BASE}/api/health`);
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.checks));
      return data.status;
    }),
  );

  results.push(
    await check("CoinGecko prices", async () => {
      const res = await fetch(`${BASE}/api/prices/simulation`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      return `${data.rounds?.length ?? 0} rounds, source=${data.meta?.priceSource}`;
    }),
  );

  results.push(
    await check("Wallet analyze", async () => {
      const res = await fetch(`${BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: WALLET }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      const hint = data.meta?.transferHint ? ` — ${data.meta.transferHint}` : "";
      return `${data.meta?.transferCount ?? 0} transfers (${data.meta?.source})${hint}`;
    }),
  );

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed.`);

  if (passed < results.length) process.exit(1);
}

main();
