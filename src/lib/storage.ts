import type { BehaviourProfile } from "@/lib/analysis/types";
import type { Trade } from "@/lib/analysis/types";
import type { TradingDNA } from "@/lib/dna/types";
import type { TwinProfile } from "@/lib/twin/types";
import type { SimulationOutcome, SimulationSession } from "@/lib/simulation/types";

const ANALYSIS_KEY = "tradetwin:analysis";
const SIMULATION_KEY = "tradetwin:simulation";

export interface PersistedAnalysis {
  profile: BehaviourProfile;
  dna: TradingDNA;
  twin: TwinProfile;
  trades: Trade[];
  lastAddress: string;
  dataSource?: string;
  transferCount?: number;
  priceSource?: string;
}

export interface PersistedSimulation {
  session: SimulationSession | null;
  outcome: SimulationOutcome | null;
}

export function loadAnalysis(): PersistedAnalysis | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ANALYSIS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAnalysis;
  } catch {
    return null;
  }
}

export function saveAnalysis(data: PersistedAnalysis) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANALYSIS_KEY, JSON.stringify(data));
}

export function clearStoredAnalysis() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANALYSIS_KEY);
}

export function loadSimulation(): PersistedSimulation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SIMULATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSimulation;
  } catch {
    return null;
  }
}

export function saveSimulation(data: PersistedSimulation) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIMULATION_KEY, JSON.stringify(data));
}

export function clearStoredSimulation() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SIMULATION_KEY);
}
