export const tradeTwinRegistryAbi = [
  {
    type: "function",
    name: "registerTwin",
    inputs: [
      { name: "twinHash", type: "bytes32" },
      { name: "tradeCount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordSimulation",
    inputs: [
      { name: "userReturnBps", type: "int32" },
      { name: "twinReturnBps", type: "int32" },
      { name: "winner", type: "uint8" },
      { name: "rounds", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordAchievement",
    inputs: [{ name: "achievementId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "twins",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "twinHash", type: "bytes32" },
      { name: "tradeCount", type: "uint64" },
      { name: "registeredAt", type: "uint64" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "achievements",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSimulationCount",
    inputs: [{ name: "trader", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasAchievement",
    inputs: [
      { name: "trader", type: "address" },
      { name: "achievementId", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TwinRegistered",
    inputs: [
      { name: "trader", type: "address", indexed: true },
      { name: "twinHash", type: "bytes32", indexed: false },
      { name: "tradeCount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SimulationRecorded",
    inputs: [
      { name: "trader", type: "address", indexed: true },
      { name: "userReturnBps", type: "int32", indexed: false },
      { name: "twinReturnBps", type: "int32", indexed: false },
      { name: "winner", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AchievementRecorded",
    inputs: [
      { name: "trader", type: "address", indexed: true },
      { name: "achievementId", type: "bytes32", indexed: false },
    ],
  },
] as const;
