export const simulateCalibration = (score) => {
  const i1 = score + 1;
  const i2 = score;
  const i3 = score - 1;

  const variance = Math.abs(i1 - i3);
  return variance;
};
