import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetLeaderboard, getGetLeaderboardQueryKey, useGetOverviewLeaderboard, getGetOverviewLeaderboardQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, TIER_GLOW, EU_COUNTRIES, crafatarUrl, type ModeKey } from "@/lib/tiers";
import { Trophy, Crown } from "lucide-react";
import logoUrl from "@assets/joyedtier_1777740585038.png";

type TabKey = ModeKey | "overview";

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["Unranked"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${cls}`}>
      {tier === "HT1" && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
      {tier}
    </span>
  );
}

function PlayerAvatar({ uuid, username }: { uuid: string; username: string }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? `https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=40&overlay=true` : crafatarUrl(uuid)}
      alt={username}
      className="w-8 h-8 flex-shrink-0"
      style={{ imageRendering: "pixelated" }}
      onError={() => setError(true)}
    />
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-amber-400 font-bold font-mono text-sm">#1</span>;
  if (rank === 2) return <span className="text-zinc-300 font-bold font-mono text-sm">#2</span>;
  if (rank === 3) return <span className="text-orange-400 font-bold font-mono text-sm">#3</span>;
  return <span className="text-muted-foreground font-mono text-sm">#{rank}</span>;
}

function ModeLeaderboard({ mode }: { mode: ModeKey }) {
  const { data, isLoading, isError } = useGetLeaderboard(mode, undefined, {
    query: { queryKey: getGetLeaderboardQueryKey(mode) },
  });

  if (isLoading) return <LeaderboardSkeleton />;
  if (isError || !data) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-sm">Failed to load leaderboard. Check that the Replit IP is whitelisted in PebbleHost.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-20 text-muted-foreground">
      <p>No ranked players yet.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Rank</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Tier</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">MMR</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Fights</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.uuid}
              className={`border-b border-border/50 transition-colors hover:bg-card/80 ${entry.isHT1 ? "bg-amber-500/5 hover:bg-amber-500/10" : ""} ${TIER_GLOW[entry.tier] ?? ""}`}
            >
              <td className="py-3 px-4">
                <RankBadge rank={entry.rank} />
              </td>
              <td className="py-3 px-4">
                <Link href={`/player/${entry.username}`}>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <PlayerAvatar uuid={entry.uuid} username={entry.username} />
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {entry.username}
                    </span>
                    {entry.isHT1 && <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </div>
                </Link>
              </td>
              <td className="py-3 px-4">
                <TierBadge tier={entry.tier} />
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono font-semibold text-foreground">{entry.mmr.toLocaleString()}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-muted-foreground">{entry.fights.toLocaleString()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <p className="text-sm">Failed to load overview. Check that the Replit IP is whitelisted in PebbleHost.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-20 text-muted-foreground">
      <p>No ranked players yet.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Rank</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Total MMR</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Modes</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Fights</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.uuid}
              className="border-b border-border/50 transition-colors hover:bg-card/80"
            >
              <td className="py-3 px-4">
                <RankBadge rank={entry.rank} />
              </td>
              <td className="py-3 px-4">
                <Link href={`/player/${entry.username}`}>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <PlayerAvatar uuid={entry.uuid} username={entry.username} />
                    <div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                        {entry.username}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.rankedModes} modes ranked</span>
                    </div>
                  </div>
                </Link>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono font-bold text-primary">{entry.totalMMR.toLocaleString()}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-muted-foreground">{entry.rankedModes}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-mono text-muted-foreground">{entry.totalWins.toLocaleString()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-8 h-8 rounded-none" />
          <Skeleton className="w-32 h-4" />
          <div className="flex-1" />
          <Skeleton className="w-16 h-5 rounded" />
          <Skeleton className="w-16 h-4" />
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
      .then((d) => {
        setRegion(EU_COUNTRIES.has(d.country_code) ? "EU" : "US");
      })
      .catch(() => setRegion("US"));
  }, []);

  const activeMode = MODES.find((m) => m.key === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + region */}
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="JoyedTiers"
              className="h-10 w-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            {region && (
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 tracking-widest uppercase">
                {region}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">Minecraft PvP Leaderboard</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-card/50 rounded-lg p-1 border border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Overview
          </button>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === m.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-border bg-card/80">
            <h2 className="text-lg font-bold text-foreground">
              {activeTab === "overview" ? "Overall Rankings" : `${activeMode?.label ?? activeTab} Rankings`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === "overview"
                ? "Top players by combined MMR across all modes"
                : "Ranked players sorted by MMR — top 50"}
            </p>
          </div>

          {activeTab === "overview" ? <OverviewLeaderboard /> : <ModeLeaderboard mode={activeTab as ModeKey} />}
        </div>
      </main>
    </div>
  );
}
