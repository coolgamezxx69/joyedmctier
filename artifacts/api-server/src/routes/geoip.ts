import { Router } from "express";

const router = Router();

const EU_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
  "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES",
  "SE","GB","NO","CH","IS","LI","AL","BA","ME","MK","RS","XK",
]);

function isPrivateIP(ip: string): boolean {
  return (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.")
  );
}

async function lookupCountryCode(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.countryCode ?? null;
  } catch {
    return null;
  }
}

router.get("/geoip", async (req, res) => {
  // Try X-Forwarded-For first, then req.ip
  const forwarded = (req.headers["x-forwarded-for"] as string) || "";
  const ip = forwarded.split(",")[0].trim() || req.ip || req.connection?.remoteAddress || "";
  if (isPrivateIP(ip)) {
    return res.json({ region: "US", countryCode: null });
  }
  const code = await lookupCountryCode(ip);
  const region = EU_CODES.has((code ?? "").toUpperCase()) ? "EU" : "US";
  res.json({ region, countryCode: code ?? null });
});

export default router;
