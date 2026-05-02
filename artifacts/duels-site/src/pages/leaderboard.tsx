import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useGetLeaderboard, getGetLeaderboardQueryKey,
  useGetOverviewLeaderboard, getGetOverviewLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, TIER_BORDER_GLOW, EU_COUNTRIES, crafatarUrl, type ModeKey } from "@/lib/tiers";
import { Trophy, Crown, Swords, Star } from "lucide-react";
import logoUrl from "@assets/joyedtier_1777740585038.png";

type TabKey = ModeKey | "overview";

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["Unranked"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono tracking-wide ${cls}`}>
      {tier === "HT1" && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
      {tier}
    </span>
  );
}

function PlayerHead({ uuid, username }: { uuid: string; username: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored
        ? `https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=40&overlay=true`
        : crafatarUrl(uuid, 40)}
      alt={username}
      className="w-10 h-10 flex-shrink-0 drop-shadow-lg"
      style={{ imageRendering: "pixelated" }}
      onError={() => setErrored(true)}
    />
  );
}

function RegionBadge({ region }: { region?: string | null }) {
  if (!region) return null;
  const isEU = region === "EU";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider flex-shrink-0 ${
      isEU
        ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
        : "bg-sky-500/15 text-sky-400 border border-sky-500/25"
    }`}>
      {region}
    </span>
  );
}

function WinLoss({ wins, losses }: { wins: number; losses: number }) {
  return (
    <div className="flex items-center justify-end gap-1 font-mono text-xs">
      <span className="text-emerald-400 font-bold">W{wins}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-red-400 font-bold">L{losses}</span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="rank-1 inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-black font-mono">
      1
    </span>
  );
  if (rank === 2) return (
    <span className="rank-2 inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-black font-mono">
      2
    </span>
  );
  if (rank === 3) return (
    <span className="rank-3 inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-black font-mono">
      3
    </span>
  );
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold font-mono text-muted-foreground">
      {rank}
    </span>
  );
}

function ModeLeaderboard({ mode }: { mode: ModeKey }) {
  const { data, isLoading, isError } = useGetLeaderboard(mode, undefined, {
    query: { queryKey: getGetLeaderboardQueryKey(mode) },
  });

  if (isLoading) return <LeaderboardSkeleton />;
  if (isError || !data) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-sm">Failed to load leaderboard.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-20 text-muted-foreground">
      <p>No ranked players yet.</p>
    </div>
  );

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3 px-4 pb-1">
        <div className="w-9" />
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</div>
        <div className="w-20 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">MMR</div>
        <div className="w-24 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">W / L</div>
        <div className="w-20 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</div>
        <div className="w-20 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</div>
      </div>
      {entries.map((entry) => (
        <Link key={entry.uuid} href={`/player/${entry.username}`}>
          <div className={`glass-card rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer ${entry.isHT1 ? "row-ht1" : ""} ${TIER_BORDER_GLOW[entry.tier] ?? ""}`}>
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate">{entry.username}</span>
                {entry.isHT1 && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                <RegionBadge region={entry.region} />
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="font-mono text-sm text-foreground font-semibold">{entry.mmr.toLocaleString()}</span>
            </div>
            <div className="w-24 text-right">
              <WinLoss wins={entry.wins} losses={entry.losses} />
            </div>
            <div className="w-20 text-right">
              <span className="font-mono font-bold text-sky-400 text-base">{entry.points}</span>
              <span className="text-muted-foreground text-xs ml-0.5">pts</span>
            </div>
            <div className="w-20 text-right">
              <TierBadge tier={entry.tier} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function OverviewLeaderboard() {
  const { data, isLoading, isError } = useGetOverviewLeaderboard(undefined, {
    query: { queryKey: getGetOverviewLeaderboardQueryKey() },
  });

  if (isLoading) return <LeaderboardSkeleton />;
  if (isError || !data) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-sm">Failed to load overview.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-20 text-muted-foreground">
      <p>No ranked players yet.</p>
    </div>
  );

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3 px-4 pb-1">
        <div className="w-9" />
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</div>
        <div className="w-24 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">W / L</div>
        <div className="w-24 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</div>
      </div>
      {entries.map((entry) => (
        <Link key={entry.uuid} href={`/player/${entry.username}`}>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate">{entry.username}</span>
                <RegionBadge region={entry.region} />
              </div>
              <span className="text-xs text-muted-foreground">{entry.rankedModes} mode{entry.rankedModes !== 1 ? "s" : ""} ranked</span>
            </div>
            <div className="w-24 text-right">
              <WinLoss wins={entry.totalWins} losses={entry.totalLosses} />
            </div>
            <div className="w-24 text-right">
              <span className="font-mono font-bold text-sky-400 text-lg">{entry.totalPoints}</span>
              <span className="text-muted-foreground text-xs ml-0.5">pts</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded" />
          <Skeleton className="w-32 h-4 flex-1" />
          <Skeleton className="w-16 h-5 rounded-md" />
          <Skeleton className="w-12 h-4" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [region, setRegion] = useState<"US" | "EU" | null>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => setRegion(EU_COUNTRIES.has(d.country_code) ? "EU" : "US"))
      .catch(() => setRegion("US"));
  }, []);

  const activeMode = MODES.find((m) => m.key === activeTab);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-orbs" aria-hidden>
        <div className="bg-orb-3" />
      </div>

      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="JoyedTiers"
              className="h-10 w-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            {region && (
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 tracking-widest uppercase">
                {region}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Minecraft PvP Leaderboard</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="glass-tabs rounded-2xl p-1.5 flex flex-wrap gap-1 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "glass-tab-active"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Overview
          </button>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === m.key
                  ? "glass-tab-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                {activeTab === "overview"
                  ? <><Trophy className="w-5 h-5 text-sky-400" /> Overall Rankings</>
                  : <><Star className="w-5 h-5 text-sky-400" /> {activeMode?.label ?? activeTab} Rankings</>
                }
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "overview"
                  ? "Players ranked by total ranking points across all modes"
                  : "Players sorted by MMR — top 50"}
              </p>
            </div>
          </div>

          {activeTab === "overview"
            ? <OverviewLeaderboard />
            : <ModeLeaderboard mode={activeTab as ModeKey} />
          }
        </div>
      </main>
    </div>
  );
}
