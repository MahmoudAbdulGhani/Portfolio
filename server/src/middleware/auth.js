import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "portfolio_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_SECONDS * 1000 });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
}

function readCookie(req, name) {
  const prefix = `${name}=`;
  const item = String(req.headers.cookie ?? "").split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

export function getAuthenticatedAdminId(req) {
  const token = readCookie(req, AUTH_COOKIE);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: "portfolio-admin", algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const adminId = getAuthenticatedAdminId(req);
  if (!adminId) {
    return res.status(401).json({ message: "Authentication required." });
  }
  req.adminId = adminId;
  next();
}

export function signToken(adminId) {
  return jwt.sign({ sub: adminId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "portfolio-admin",
    algorithm: "HS256",
  });
}
