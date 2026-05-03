import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useGetLeaderboard, getGetLeaderboardQueryKey,
  useGetOverviewLeaderboard, getGetOverviewLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MODES, TIER_COLORS, TIER_BORDER_GLOW, EU_COUNTRIES, type ModeKey } from "@/lib/tiers";
import { Trophy, Crown, Swords, Star, Zap } from "lucide-react";
import logoUrl from "@assets/joyedtier_1777740585038.png";

type TabKey = ModeKey | "overview";

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_COLORS[tier] ?? TIER_COLORS["Unranked"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tracking-wide ${cls}`}>
      {tier === "HT1" && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
      {tier}
    </span>
  );
}

function PlayerHead({ username, rank }: { uuid: string; username: string; rank?: number }) {
  const [errored, setErrored] = useState(false);
  const ringStyle =
    rank === 1
      ? { boxShadow: "0 0 0 2px rgba(251,191,36,.75), 0 0 12px rgba(251,191,36,.35)" }
      : rank === 2
      ? { boxShadow: "0 0 0 2px rgba(203,213,225,.55), 0 0 8px rgba(203,213,225,.2)" }
      : rank === 3
      ? { boxShadow: "0 0 0 2px rgba(251,146,60,.6), 0 0 8px rgba(251,146,60,.25)" }
      : undefined;
  return (
    <div className="relative flex-shrink-0 rounded-lg" style={ringStyle}>
      <img
        src={errored ? `https://minotar.net/helm/MHF_Steve/40` : `https://minotar.net/helm/${username}/40`}
        alt={username}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-lg block"
        style={{ imageRendering: "pixelated" }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function RegionBadge({ region }: { region?: string | null }) {
  if (!region) return null;
  const label = region === "EU" ? "EU" : "US";
  const isEU = label === "EU";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider flex-shrink-0 ${
      isEU
        ? "bg-blue-500/15 text-blue-300 border border-blue-400/28"
        : "bg-sky-500/15 text-sky-300 border border-sky-400/28"
    }`}>
      {label}
    </span>
  );
}

function WinLoss({ wins, losses }: { wins: number; losses: number }) {
  return (
    <div className="flex items-center justify-end gap-1 font-mono text-xs">
      <span className="text-emerald-400 font-bold">W{wins}</span>
      <span className="text-muted-foreground opacity-50">/</span>
      <span className="text-red-400 font-bold">L{losses}</span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="rank-1 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-base sm:text-lg font-black font-mono flex-shrink-0">1</span>
  );
  if (rank === 2) return (
    <span className="rank-2 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-black font-mono flex-shrink-0">2</span>
  );
  if (rank === 3) return (
    <span className="rank-3 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-black font-mono flex-shrink-0">3</span>
  );
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-sm font-bold font-mono text-muted-foreground/60 flex-shrink-0">{rank}</span>
  );
}

function ColHeader({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 ${right ? "text-right" : ""}`}>
      {children}
    </div>
  );
}

function ModeLeaderboard({ mode }: { mode: ModeKey }) {
  const { data, isLoading, isError } = useGetLeaderboard(mode, undefined, {
    query: { queryKey: getGetLeaderboardQueryKey(mode) },
  });

  if (isLoading) return <LeaderboardSkeleton />;
  if (isError || !data) return (
    <div className="text-center py-24 text-muted-foreground">
      <p className="text-sm">Failed to load leaderboard.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-24 text-muted-foreground">
      <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm">No ranked players yet.</p>
    </div>
  );

  return (
    <div>
      <div className="hidden sm:grid grid-cols-[40px_44px_1fr_88px_96px_80px_84px] items-center gap-3 px-7 sm:px-8 pt-3 pb-2">
        <div />
        <div />
        <ColHeader>Player</ColHeader>
        <ColHeader right>MMR</ColHeader>
        <ColHeader right>W / L</ColHeader>
        <ColHeader right>Points</ColHeader>
        <ColHeader right>Tier</ColHeader>
      </div>
      <div className="lb-scroll overflow-y-auto max-h-[370px] px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
      {entries.map((entry) => {
        const rankClass = entry.rank === 1 ? "row-rank-1" : entry.rank === 2 ? "row-rank-2" : entry.rank === 3 ? "row-rank-3" : "";
        return (
        <Link key={entry.uuid} href={`/player/${entry.username}`}>
          <div className={`glass-card rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 grid grid-cols-[36px_40px_1fr_auto] sm:grid-cols-[40px_44px_1fr_88px_96px_80px_84px] items-center gap-2 sm:gap-3 cursor-pointer ${entry.isHT1 ? "row-ht1" : ""} ${rankClass} ${TIER_BORDER_GLOW[entry.tier] ?? ""}`}>
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} rank={entry.rank} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate text-sm sm:text-[15px]">{entry.username}</span>
                {entry.isHT1 && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                <RegionBadge region={entry.region} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                <TierBadge tier={entry.tier} />
                <span className="font-mono text-xs text-sky-400 font-bold">{entry.points}pts</span>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="font-mono text-sm text-foreground/90 font-semibold">{entry.mmr.toLocaleString()}</span>
            </div>
            <div className="hidden sm:block text-right">
              <WinLoss wins={entry.wins} losses={entry.losses} />
            </div>
            <div className="hidden sm:block text-right">
              <span className="font-mono font-black text-sky-400 text-base">{entry.points}</span>
              <span className="text-muted-foreground text-[11px] ml-0.5">pts</span>
            </div>
            <div className="hidden sm:flex justify-end">
              <TierBadge tier={entry.tier} />
            </div>
            <div className="sm:hidden flex flex-col items-end gap-1">
              <span className="font-mono text-xs text-foreground/80">{entry.mmr.toLocaleString()}</span>
              <WinLoss wins={entry.wins} losses={entry.losses} />
            </div>
          </div>
        </Link>
        );
      })}
      </div>
    </div>
  );
}

function OverviewLeaderboard() {
  const { data, isLoading, isError } = useGetOverviewLeaderboard(undefined, {
    query: { queryKey: getGetOverviewLeaderboardQueryKey() },
  });

  if (isLoading) return <LeaderboardSkeleton />;
  if (isError || !data) return (
    <div className="text-center py-24 text-muted-foreground">
      <p className="text-sm">Failed to load overview.</p>
    </div>
  );

  const entries = data.entries ?? [];
  if (!entries.length) return (
    <div className="text-center py-24 text-muted-foreground">
      <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm">No ranked players yet.</p>
    </div>
  );

  return (
    <div>
      <div className="hidden sm:grid grid-cols-[40px_44px_1fr_96px_100px] items-center gap-3 px-7 sm:px-8 pt-3 pb-2">
        <div />
        <div />
        <ColHeader>Player</ColHeader>
        <ColHeader right>W / L</ColHeader>
        <ColHeader right>Points</ColHeader>
      </div>
      <div className="lb-scroll overflow-y-auto max-h-[370px] px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
      {entries.map((entry) => {
        const rankClass = entry.rank === 1 ? "row-rank-1" : entry.rank === 2 ? "row-rank-2" : entry.rank === 3 ? "row-rank-3" : "";
        return (
        <Link key={entry.uuid} href={`/player/${entry.username}`}>
          <div className={`glass-card rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 grid grid-cols-[36px_40px_1fr_auto] sm:grid-cols-[40px_44px_1fr_96px_100px] items-center gap-2 sm:gap-3 cursor-pointer ${rankClass}`}>
            <RankBadge rank={entry.rank} />
            <PlayerHead uuid={entry.uuid} username={entry.username} rank={entry.rank} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground truncate text-sm sm:text-[15px]">{entry.username}</span>
                <RegionBadge region={entry.region} />
              </div>
              <span className="text-[11px] text-muted-foreground">{entry.rankedModes} mode{entry.rankedModes !== 1 ? "s" : ""} ranked</span>
            </div>
            <div className="hidden sm:block text-right">
              <WinLoss wins={entry.totalWins} losses={entry.totalLosses} />
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-sky-400 text-lg sm:text-xl">{entry.totalPoints}</span>
              <span className="text-muted-foreground text-[11px] ml-0.5">pts</span>
            </div>
          </div>
        </Link>
        );
      })}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="p-3 sm:p-4 space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3">
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0" />
          <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
          <Skeleton className="hidden sm:block w-16 h-5 rounded-md" />
          <Skeleton className="hidden sm:block w-14 h-4" />
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

      {/* ── Sticky compact nav ── */}
      <header className={`glass-header sticky top-0 z-20 transition-all duration-400 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="JoyedTiers" className="h-7 w-auto object-contain" style={{ imageRendering: "pixelated" }} />
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-sky-300 to-white bg-clip-text text-transparent">JoyedTiers</span>
          </div>
          {region && (
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border tracking-widest uppercase ${
              region === "EU"
                ? "bg-blue-500/12 text-blue-300 border-blue-400/25"
                : "bg-sky-500/12 text-sky-300 border-sky-400/25"
            }`}>{region}</span>
          )}
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section className="relative z-10 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center overflow-hidden">
        <div className="hero-glow-ring" aria-hidden />
        <div className="relative">
          <div className="hero-logo-wrap mx-auto">
            <div className="hero-logo-halo" aria-hidden />
            <div className="hero-logo-halo-2" aria-hidden />
            <img
              src={logoUrl}
              alt="JoyedTiers"
              className="hero-logo relative mx-auto"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h1 className="hero-title mt-6 sm:mt-8 px-4">JoyedTiers</h1>
          <p className="hero-subtitle mt-3 flex items-center justify-center gap-2 px-4">
            <Swords className="w-4 h-4 flex-shrink-0 opacity-70" />
            Minecraft PvP Ranked Leaderboard with live match data
          </p>
          {region && (
            <div className="mt-5">
              <span className={`inline-flex items-center gap-2 text-xs font-bold font-mono px-4 py-2 rounded-full border tracking-widest uppercase ${
                region === "EU"
                  ? "bg-blue-500/10 text-blue-300 border-blue-400/28"
                  : "bg-sky-500/10 text-sky-300 border-sky-400/28"
              }`}
              style={{ backdropFilter: "blur(16px)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {region} Region
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-5 pb-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="glass rounded-3xl p-5 text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Live data</p>
            <p className="mt-3 text-2xl font-black text-foreground">Updated instantly</p>
            <p className="mt-2 text-sm text-muted-foreground">Leaderboard values are pulled directly from your game database.</p>
          </div>
          <div className="glass rounded-3xl p-5 text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Rank requirement</p>
            <p className="mt-3 text-2xl font-black text-foreground">10 matches</p>
            <p className="mt-2 text-sm text-muted-foreground">Players need 10 duel matches to appear on the leaderboard.</p>
          </div>
          <div className="glass rounded-3xl p-5 text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Modes</p>
            <p className="mt-3 text-2xl font-black text-foreground">8 tracked</p>
            <p className="mt-2 text-sm text-muted-foreground">All major PvP modes are included in ranking calculations.</p>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-5 pb-14">
        {/* ── Tab bar ── */}
        <div ref={tabsRef} className="glass-tabs rounded-2xl p-2 mb-5 overflow-x-auto tabs-scroll">
          <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "overview" ? "glass-tab-active" : "text-muted-foreground hover:text-foreground hover:bg-white/6"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              Overview
            </button>
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveTab(m.key)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === m.key ? "glass-tab-active" : "text-muted-foreground hover:text-foreground hover:bg-white/6"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Leaderboard panel with gradient outer border ── */}
        <div className="glass-wrap">
          <div className="glass rounded-[1.1rem] overflow-hidden">
            {/* Panel header */}
            <div className="px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between"
              style={{ background: "linear-gradient(to bottom, rgba(255,255,255,.05), rgba(255,255,255,.01))" }}>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                  {activeTab === "overview"
                    ? <><Trophy className="w-5 h-5 text-sky-400" /> Overall Rankings</>
                    : <><Star className="w-5 h-5 text-sky-400" /> {activeMode?.label ?? activeTab} Rankings</>
                  }
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === "overview"
                    ? "Ranked by total points across all modes"
                    : "Sorted by MMR — top 50 players"}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(56,189,248,.08)", border: "1px solid rgba(56,189,248,.15)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[11px] font-mono font-semibold text-sky-400 tracking-wide">LIVE</span>
              </div>
            </div>
            <div className="glass-rainbow-line" />

            {activeTab === "overview"
              ? <OverviewLeaderboard />
              : <ModeLeaderboard mode={activeTab as ModeKey} />
            }
          </div>
          <div className="mt-4 px-5 sm:px-8 pb-6 text-center text-sm text-muted-foreground">
            10 duel matches are required to be ranked and appear on the leaderboard.
          </div>
        </div>
      </main>
    </div>
  );
}
