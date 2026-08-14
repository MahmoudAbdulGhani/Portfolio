import { isIP } from "node:net";

export function getClientIp(req) {
  let value = String(req.ip ?? req.socket?.remoteAddress ?? "").trim().toLowerCase();
  if (value.startsWith("::ffff:") && isIP(value.slice(7)) === 4) value = value.slice(7);
  const zone = value.indexOf("%");
  if (zone !== -1) value = value.slice(0, zone);
  if (isIP(value) === 6) {
    try { value = new URL(`http://[${value}]/`).hostname.slice(1, -1); } catch { return "unknown"; }
  }
  return isIP(value) ? value : "unknown";
}
