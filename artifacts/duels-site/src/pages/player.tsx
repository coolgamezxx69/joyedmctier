import { useParams, Link } from "wouter";
import { useGetPlayer, getGetPlayerQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, crafatarUrl } from "@/lib/tiers";
import { ArrowLeft, Crown, Swords, Trophy } from "lucide-react";

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["Unranked"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${cls}`}>
      {tier === "HT1" && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
      {tier}
    </span>
  );
}

function ProgressBar({ value, tier }: { value: number; tier: string }) {
  const colorMap: Record<string, string> = {
    HT1: "bg-amber-400",
    LT1: "bg-yellow-400",
    HT2: "bg-purple-500",
    LT2: "bg-indigo-500",
    HT3: "bg-blue-500",
    LT3: "bg-cyan-500",
    HT4: "bg-emerald-500",
    LT4: "bg-lime-500",
    HT5: "bg-orange-500",
    LT5: "bg-zinc-500",
    Unranked: "bg-zinc-600",
  };
  const color = colorMap[tier] ?? "bg-zinc-600";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden" data-testid="progress-bar">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatBox({ label, value, color = "text-foreground" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50 border border-border">
      <span className={`text-2xl font-bold font-mono ${color}`}>{typeof value === "number" ? value.toLocaleString() : value}</span>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function PlayerPage() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, isError } = useGetPlayer(username!, {
    query: { queryKey: getGetPlayerQueryKey(username!), enabled: !!username },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Leaderboard
            </button>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-none" />
          <div className="space-y-2">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </main>
    </div>
  );

  if (isError || !data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Swords className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground">Player not found</h2>
        <p className="text-muted-foreground text-sm">No player with username "{username}" was found.</p>
        <Link href="/">
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            Back to Leaderboard
          </button>
        </Link>
      </div>
    </div>
  );

  const rankedModes = MODES.filter((m) => data.modes[m.key]?.placed);
  const totalFights = Object.values(data.modes).reduce((s, m) => s + (m?.fights ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Duels Leaderboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Player header */}
        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6 shadow-lg" data-testid="player-header">
          <img
            src={crafatarUrl(data.uuid, 80)}
            alt={data.username}
            className="w-20 h-20 flex-shrink-0"
            style={{ imageRendering: "pixelated" }}
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight" data-testid="text-username">{data.username}</h1>
            <p className="text-muted-foreground text-sm mt-1">{rankedModes.length} modes ranked</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4" data-testid="stats-summary">
          <StatBox label="Total MMR" value={data.totalMMR} color="text-primary" />
          <StatBox label="Total Wins" value={data.totalWins} color="text-emerald-400" />
          <StatBox label="Total Losses" value={data.totalLosses} color="text-red-400" />
        </div>

        {/* Per-mode stats */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Mode Breakdown
          </h2>
          <div className="grid gap-3" data-testid="mode-breakdown">
            {MODES.map((m) => {
              const stats = data.modes[m.key];
              if (!stats) return (
                <div key={m.key} className="rounded-xl border border-border/50 bg-card/60 px-5 py-4 flex items-center justify-between opacity-50">
                  <span className="font-semibold text-muted-foreground">{m.label}</span>
                  <span className="text-xs text-muted-foreground">Not played</span>
                </div>
              );

              return (
                <div key={m.key} className="rounded-xl border border-border bg-card px-5 py-4 space-y-3" data-testid={`mode-card-${m.key}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{m.label}</span>
                      {stats.isHT1 && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <TierBadge tier={stats.tier} />
                  </div>
                  <ProgressBar value={stats.progress} tier={stats.tier} />
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">MMR</span>
                      <span className="font-mono font-bold text-foreground">{stats.mmr.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Wins</span>
                      <span className="font-mono font-bold text-emerald-400">{stats.wins.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Losses</span>
                      <span className="font-mono font-bold text-red-400">{stats.losses.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Fights</span>
                      <span className="font-mono font-semibold text-foreground">{stats.fights.toLocaleString()}</span>
                    </div>
                    {!stats.placed && (
                      <div className="ml-auto">
                        <span className="text-xs text-muted-foreground">{stats.fights}/10 placements</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
