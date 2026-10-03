import { createContext, useContext } from "react";

export const MotionContext = createContext({ enabled: false, cinematic: false });
export const useLandingMotion = () => useContext(MotionContext);
