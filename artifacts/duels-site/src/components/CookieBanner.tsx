import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem("jt_cookie_accepted");
      setAccepted(v === "1");
    } catch {
      setAccepted(true);
    }
  }, []);
  if (accepted === true) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-50">
      <div className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold">We use cookies</div>
          <div className="text-sm text-muted-foreground">Cookies help keep the leaderboard live and personalised.</div>
        </div>
        <div>
          <button className="btn" onClick={() => { localStorage.setItem("jt_cookie_accepted", "1"); setAccepted(true); }}>Accept</button>
        </div>
      </div>
    </div>
  );
}
