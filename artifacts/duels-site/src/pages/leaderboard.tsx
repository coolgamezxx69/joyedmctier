import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useGetLeaderboard, getGetLeaderboardQueryKey,
  useGetOverviewLeaderboard, getGetOverviewLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, TIER_BORDER_GLOW, EU_COUNTRIES, type ModeKey } from "@/lib/tiers";
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

function PlayerHead({ username }: { uuid: string; username: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? `https://minotar.net/helm/MHF_Steve/40` : `https://minotar.net/helm/${username}/40`}
      alt={username}
      className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 drop-shadow-lg"
      style={{ imageRendering: "pixelated" }}
      onError={() => setErrored(true)}
    />
  );
}

function RegionBadge({ region }: { region?: string | null }) {
  if (!region) return null;
  const label = region === "EU" ? "EU" : "US";
  const isEU = label === "EU";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider flex-shrink-0 ${
      isEU
        ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
        : "bg-sky-500/15 text-sky-400 border border-sky-500/25"
    }`}>
      {label}
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
    <span className="rank-1 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-black font-mono">1</span>
  );
  if (rank === 2) return (
    <span className="rank-2 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-black font-mono">2</span>
  );
  if (rank === 3) return (
    <span className="rank-3 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-black font-mono">3</span>
  );
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-bold font-mono text-muted-foreground">{rank}</span>
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
    <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
      <div className="hidden sm:flex items-center gap-3 px-4 pb-1">
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
          <div className={`glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 cursor-pointer ${entry.isHT1 ? "row-ht1" : ""} ${TIER_BORDER_GLOW[entry.tier] ?? ""}`}>
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate text-sm sm:text-base">{entry.username}</span>
                {entry.isHT1 && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                <RegionBadge region={entry.region} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                <TierBadge tier={entry.tier} />
                <span className="font-mono text-xs text-sky-400 font-bold">{entry.points}pts</span>
              </div>
            </div>
            <div className="hidden sm:block w-20 text-right">
              <span className="font-mono text-sm text-foreground font-semibold">{entry.mmr.toLocaleString()}</span>
            </div>
            <div className="hidden sm:block w-24 text-right">
              <WinLoss wins={entry.wins} losses={entry.losses} />
            </div>
            <div className="hidden sm:block w-20 text-right">
              <span className="font-mono font-bold text-sky-400 text-base">{entry.points}</span>
              <span className="text-muted-foreground text-xs ml-0.5">pts</span>
            </div>
            <div className="hidden sm:block w-20 text-right">
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
    <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
      <div className="hidden sm:flex items-center gap-3 px-4 pb-1">
        <div className="w-9" />
        <div className="w-10 flex-shrink-0" />
        <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</div>
        <div className="w-24 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">W / L</div>
        <div className="w-24 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</div>
      </div>
      {entries.map((entry) => (
        <Link key={entry.uuid} href={`/player/${entry.username}`}>
          <div className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 cursor-pointer">
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate text-sm sm:text-base">{entry.username}</span>
                <RegionBadge region={entry.region} />
              </div>
              <span className="text-xs text-muted-foreground">{entry.rankedModes} mode{entry.rankedModes !== 1 ? "s" : ""} ranked</span>
            </div>
            <div className="hidden sm:block w-24 text-right">
              <WinLoss wins={entry.totalWins} losses={entry.totalLosses} />
            </div>
            <div className="w-20 sm:w-24 text-right">
              <span className="font-mono font-bold text-sky-400 text-base sm:text-lg">{entry.totalPoints}</span>
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
    <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded" />
          <Skeleton className="w-28 h-4 flex-1" />
          <Skeleton className="hidden sm:block w-16 h-5 rounded-md" />
          <Skeleton className="hidden sm:block w-12 h-4" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [region, setRegion] = useState<"US" | "EU" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => setRegion(EU_COUNTRIES.has(d.country_code) ? "EU" : "US"))
      .catch(() => setRegion("US"));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeMode = MODES.find((m) => m.key === activeTab);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-orbs" aria-hidden>
        <div className="bg-orb-3" />
      </div>

      {/* ── Sticky compact nav (fades in after scrolling) ── */}
      <header className={`glass-header sticky top-0 z-20 transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="JoyedTiers" className="h-7 w-auto object-contain" style={{ imageRendering: "pixelated" }} />
            <span className="font-black text-base tracking-tight text-foreground">JoyedTiers</span>
          </div>
          <div className="flex items-center gap-2">
            {region && (
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border tracking-widest uppercase ${
                region === "EU"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-sky-500/10 text-sky-400 border-sky-500/20"
              }`}>{region}</span>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section className="relative z-10 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center overflow-hidden">
        <div className="hero-glow-ring" aria-hidden />
        <div className="relative">
          <div className="hero-logo-wrap mx-auto">
            <div className="hero-logo-halo" aria-hidden />
            <img
              src={logoUrl}
              alt="JoyedTiers"
              className="hero-logo relative mx-auto drop-shadow-2xl"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h1 className="hero-title mt-5 sm:mt-6 px-4">JoyedTiers</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground flex items-center justify-center gap-2 px-4">
            <Swords className="w-4 h-4 flex-shrink-0" />
            Minecraft PvP Ranked Leaderboard
          </p>
          {region && (
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1.5 rounded-full border tracking-widest uppercase ${
                region === "EU"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  : "bg-sky-500/10 text-sky-400 border-sky-500/25"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
                {region} Region
              </span>
            </div>
          )}
        </div>
      </section>

      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-10">
        {/* ── Tab bar (scrollable on mobile) ── */}
        <div ref={tabsRef} className="glass-tabs rounded-2xl p-1.5 mb-5 overflow-x-auto tabs-scroll">
          <div className="flex gap-1 min-w-max sm:min-w-0 sm:flex-wrap">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "overview" ? "glass-tab-active" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              Overview
            </button>
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveTab(m.key)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === m.key ? "glass-tab-active" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Leaderboard panel ── */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/6 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                {activeTab === "overview"
                  ? <><Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" /> Overall Rankings</>
                  : <><Star className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" /> {activeMode?.label ?? activeTab} Rankings</>
                }
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "overview"
                  ? "Ranked by total points across all modes"
                  : "Sorted by MMR — top 50"}
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
