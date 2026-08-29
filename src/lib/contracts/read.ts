export function parseTwinExists(result: unknown): boolean {
  if (result == null) return false;

  if (typeof result === "object" && !Array.isArray(result) && "exists" in result) {
    return Boolean((result as { exists: boolean }).exists);
  }

  if (Array.isArray(result)) {
    return result[3] === true;
  }

  return false;
}

export async function hasContractBytecode(
  getBytecode: (args: { address: `0x${string}` }) => Promise<`0x${string}` | undefined>,
  address: `0x${string}`,
): Promise<boolean> {
  try {
    const bytecode = await getBytecode({ address });
    return !!bytecode && bytecode !== "0x" && bytecode.length > 2;
  } catch {
    return false;
  }
}
