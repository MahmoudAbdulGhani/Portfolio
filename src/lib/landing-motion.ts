import { createContext, useContext } from "react";

export const MotionContext = createContext<{ enabled: boolean; cinematic: boolean; profile: "desktop" | "touch" | "reduced" }>({ enabled: false, cinematic: false, profile: "reduced" });
export const useLandingMotion = () => useContext(MotionContext);
