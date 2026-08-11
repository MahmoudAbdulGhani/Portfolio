import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token." });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.adminId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function signToken(adminId) {
  return jwt.sign({ sub: adminId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "portfolio-admin",
  });
}
