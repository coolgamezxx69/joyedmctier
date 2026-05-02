import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetPlayer, getGetPlayerQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, crafatarHeadUrl, crafatarUrl, pointsFromTier } from "@/lib/tiers";
import { ArrowLeft, Crown, Trophy, Swords } from "lucide-react";
import logoUrl from "@assets/joyedtier_1777740585038.png";

function PlayerHead({ uuid, username, size = 80 }: { uuid: string; username: string; size?: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored
        ? `https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=${size}&overlay=true`
        : crafatarUrl(uuid, size)}
      alt={username}
      className="flex-shrink-0 drop-shadow-2xl"
      style={{ imageRendering: "pixelated", width: size, height: size }}
      onError={() => setErrored(true)}
    />
  );
}

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["Unranked"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tracking-wide ${cls}`}>
      {tier === "HT1" && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
      {tier}
    </span>
  );
}

function ProgressBar({ value, tier }: { value: number; tier: string }) {
  const colorMap: Record<string, string> = {
    HT1: "bg-amber-400", LT1: "bg-yellow-400",
    HT2: "bg-purple-500", LT2: "bg-indigo-500",
    HT3: "bg-blue-500",   LT3: "bg-cyan-500",
    HT4: "bg-emerald-500",LT4: "bg-lime-500",
    HT5: "bg-orange-500", LT5: "bg-zinc-500",
    Unranked: "bg-zinc-600",
  };
  const color = colorMap[tier] ?? "bg-zinc-600";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function PlayerPage() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, isError } = useGetPlayer(username!, {
    query: { queryKey: getGetPlayerQueryKey(username!), enabled: !!username },
  });

  const header = (
    <header className="glass-header sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="JoyedTiers" className="h-8 w-auto object-contain" style={{ imageRendering: "pixelated" }} />
        </div>
      </div>
    </header>
  );

  if (isLoading) return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-orbs" aria-hidden><div className="bg-orb-3" /></div>
      {header}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="glass rounded-2xl p-6 flex items-center gap-5">
          <Skeleton className="w-20 h-20 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-40 h-7" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </main>
    </div>
  );

  if (isError || !data) return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-orbs" aria-hidden><div className="bg-orb-3" /></div>
      {header}
      <div className="relative z-10 flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Player not found</h2>
          <p className="text-muted-foreground text-sm">No player with username "{username}" was found.</p>
        </div>
      </div>
    </div>
  );

  const rankedModes = MODES.filter((m) => data.modes[m.key]?.placed);
  const totalPoints = rankedModes.reduce((sum, m) => {
    const stats = data.modes[m.key];
    if (!stats) return sum;
    return sum + pointsFromTier(stats.isHT1 ? "HT1" : stats.tier);
  }, 0);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-orbs" aria-hidden><div className="bg-orb-3" /></div>

      {header}

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Player hero card */}
        <div className="glass rounded-2xl p-6 flex items-center gap-5">
          <PlayerHead uuid={data.uuid} username={data.username} size={80} />
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">{data.username}</h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" />
              {rankedModes.length} mode{rankedModes.length !== 1 ? "s" : ""} ranked
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl flex flex-col items-center p-5">
            <span className="text-3xl font-black font-mono text-sky-400">{totalPoints}</span>
            <span className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Total Points
            </span>
          </div>
          <div className="glass rounded-xl flex flex-col items-center p-5">
            <span className="text-3xl font-black font-mono text-foreground">{data.totalWins.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider flex items-center gap-1">
              <Swords className="w-3 h-3" /> Total Fights
            </span>
          </div>
        </div>

        {/* Per-mode stats */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-sky-400" />
            Mode Breakdown
          </h2>
          <div className="grid gap-2">
            {MODES.map((m) => {
              const stats = data.modes[m.key];
              if (!stats) return (
                <div key={m.key} className="glass rounded-xl px-5 py-4 flex items-center justify-between opacity-40">
                  <span className="font-semibold text-muted-foreground text-sm">{m.label}</span>
                  <span className="text-xs text-muted-foreground">Not played</span>
                </div>
              );

              const pts = pointsFromTier(stats.isHT1 ? "HT1" : stats.tier);

              return (
                <div key={m.key} className="glass rounded-xl px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{m.label}</span>
                      {stats.isHT1 && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400 text-sm">{pts} pts</span>
                      <TierBadge tier={stats.isHT1 ? "HT1" : stats.tier} />
                    </div>
                  </div>
                  {stats.placed && <ProgressBar value={stats.progress} tier={stats.isHT1 ? "HT1" : stats.tier} />}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">MMR</span>
                      <span className="font-mono font-bold text-foreground">{stats.mmr.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider block">Fights</span>
                      <span className="font-mono font-bold text-foreground">{stats.fights.toLocaleString()}</span>
                    </div>
                    {!stats.placed && (
                      <div className="ml-auto flex items-end">
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
