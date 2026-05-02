export const TIER_COLORS: Record<string, string> = {
  HT1: "bg-amber-400/20 text-amber-300 border border-amber-400/40",
  LT1: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
  HT2: "bg-purple-600/20 text-purple-300 border border-purple-500/40",
  LT2: "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40",
  HT3: "bg-blue-600/20 text-blue-300 border border-blue-500/40",
  LT3: "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40",
  HT4: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40",
  LT4: "bg-lime-600/20 text-lime-300 border border-lime-500/40",
  HT5: "bg-orange-600/20 text-orange-300 border border-orange-500/40",
  LT5: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40",
  Unranked: "bg-zinc-800/40 text-zinc-500 border border-zinc-700/40",
};

export const TIER_GLOW: Record<string, string> = {
  HT1: "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
  LT1: "shadow-[0_0_8px_rgba(234,179,8,0.2)]",
  HT2: "shadow-[0_0_8px_rgba(168,85,247,0.2)]",
  LT2: "shadow-[0_0_8px_rgba(99,102,241,0.2)]",
  HT3: "shadow-[0_0_8px_rgba(59,130,246,0.2)]",
  LT3: "shadow-[0_0_8px_rgba(6,182,212,0.2)]",
  HT4: "shadow-[0_0_8px_rgba(16,185,129,0.2)]",
  LT4: "",
  HT5: "",
  LT5: "",
  Unranked: "",
};

export const MODES = [
  { key: "sword", label: "Sword" },
  { key: "axe", label: "Axe" },
  { key: "dpot", label: "Diamond Pot" },
  { key: "nethpot", label: "Netherite Pot" },
  { key: "smp", label: "SMP" },
  { key: "crystal", label: "CrystalPVP" },
  { key: "mace", label: "Mace" },
  { key: "uhc", label: "UHC" },
] as const;

export type ModeKey = (typeof MODES)[number]["key"];

export const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
  "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES",
  "SE","GB","NO","CH","IS","NL","LI","AL","BA","ME","MK","RS","XK",
]);

export function crafatarUrl(uuid: string, size = 40): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay=true&default=MHF_Steve`;
}
