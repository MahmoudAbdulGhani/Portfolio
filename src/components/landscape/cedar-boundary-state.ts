// Browser-local teaching subset of Cedar's inspected advisor. No persistence/AI.
export const cedarEvidence = {
  repository: 'https://github.com/nireezalsweidan/Construction-Project-Management-Accounting-System',
  revision: 'ab4aff541fb46b6c54831f16a4352657369c1063',
};
export const cedarSample = { contract: 100000, supplier: 25000, contractor: 15000 };
export const progressChoices = [0, 25, 50, 75, 100];
export function calculateCedarFigures(contract: number, actual: number, progress: number) {
  if (![contract, actual, progress].every(Number.isFinite) || contract < 0 || actual < 0) throw new RangeError('Use finite, nonnegative sample amounts.');
  const ratio = Math.max(0, Math.min(progress / 100, 1));
  const total = Math.max(contract > 0 && ratio > 0 ? actual / ratio : actual, actual);
  return { progress: ratio * 100, total, margin: contract > 0 ? (contract - total) / contract * 100 : 0, costRatio: contract > 0 ? actual / contract * 100 : 0 };
}
export const cedarMoney = (value: number) => `USD ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const sampleFigures = (progress: number) => calculateCedarFigures(cedarSample.contract, cedarSample.supplier + cedarSample.contractor, progress);
export function cedarInterpretation(progress: number) {
  const figures = sampleFigures(progress);
  return progress === 0
    ? `With no reported phase progress, the rule keeps the current invoiced cost of ${cedarMoney(figures.total)}; it does not extrapolate a total from progress. This fallback is not evidence that the project will finish at that cost.`
    : `At ${progress}% average phase progress, the invoiced cost scales to a ${cedarMoney(figures.total)} total-cost estimate. Against the ${cedarMoney(cedarSample.contract)} contract, the estimated margin is ${figures.margin.toFixed(2)}%. This is a trend-based estimate, not a prediction.`;
}
export type CedarState = { progress: number; phase: 'inspect' | 'interpret' | 'changed'; interpretation: { progress: number; text: string } | null; announcement: string };
export type CedarAction = { type: 'change'; progress: number } | { type: 'interpret' | 'reset' };
export const initialCedar = (): CedarState => ({ progress: 50, phase: 'inspect', interpretation: null, announcement: '' });
export function cedarReducer(state: CedarState, action: CedarAction): CedarState {
  if (action.type === 'reset') return { ...initialCedar(), announcement: 'Demonstration reset. Progress: 50%. Calculated estimate: USD 80,000.00.' };
  if (action.type === 'change') {
    if (!progressChoices.includes(action.progress) || action.progress === state.progress) return state;
    return { ...state, progress: action.progress, phase: 'changed', announcement: `Figures recalculated at ${action.progress}% progress: ${cedarMoney(sampleFigures(action.progress).total)}.${state.interpretation ? ' Refresh the sample interpretation to explain these figures.' : ' Interpret the figures to reveal a sample explanation.'}` };
  }
  if (state.phase === 'interpret') return state;
  return { ...state, phase: 'interpret', interpretation: { progress: state.progress, text: cedarInterpretation(state.progress) }, announcement: `Sample interpretation refreshed for ${state.progress}% progress. Calculated figures are unchanged.` };
}
