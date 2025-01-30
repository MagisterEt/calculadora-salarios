export const calculateINSS = (gross: number) => {
  if (gross <= 1412.00) return gross * 0.075;
  if (gross <= 2666.68) return gross * 0.09;
  if (gross <= 4000.03) return gross * 0.12;
  if (gross <= 7786.02) return gross * 0.14;
  return 876.97; // Teto INSS 2024
};

export const calculateIRRF = (gross: number, inss: number) => {
  const base = gross - inss;
  
  if (base <= 2259.20) return 0;
  if (base <= 2826.65) return (base * 0.075) - 169.44;
  if (base <= 3751.05) return (base * 0.15) - 381.44;
  if (base <= 4664.68) return (base * 0.225) - 662.77;
  return (base * 0.275) - 896.00;
};

export const calculateNetFromGross = (gross: number) => {
  const inss = calculateINSS(gross);
  const irrf = calculateIRRF(gross, inss);
  return gross - inss - irrf;
};

export const calculateGrossFromNet = (liquid: number) => {
  let grossEstimate = liquid * 1.3;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.01;

  while (iterations < maxIterations) {
    const inss = calculateINSS(grossEstimate);
    const irrf = calculateIRRF(grossEstimate, inss);
    const calculatedLiquid = grossEstimate - inss - irrf;
    
    if (Math.abs(calculatedLiquid - liquid) < tolerance) {
      return {
        gross: grossEstimate,
        inss: inss,
        irrf: irrf,
        liquid: calculatedLiquid
      };
    }

    grossEstimate = grossEstimate * (liquid / calculatedLiquid);
    iterations++;
  }

  throw new Error("Não foi possível convergir para um valor preciso");
};