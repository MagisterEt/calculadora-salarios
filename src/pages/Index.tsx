import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [liquidValue, setLiquidValue] = useState("");
  const [result, setResult] = useState<{
    gross: number;
    inss: number;
    irrf: number;
    liquid: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateGrossValue = (liquid: number) => {
    // Função para calcular INSS com base no valor bruto
    const calculateINSS = (gross: number) => {
      if (gross <= 1412.00) return gross * 0.075;
      if (gross <= 2666.68) return gross * 0.09;
      if (gross <= 4000.03) return gross * 0.12;
      if (gross <= 7786.02) return gross * 0.14;
      return 876.97; // Teto INSS 2024
    };

    // Função para calcular IRRF com base no valor bruto e INSS
    const calculateIRRF = (gross: number, inss: number) => {
      const base = gross - inss;
      
      if (base <= 2112.00) return 0;
      if (base <= 2826.65) return (base * 0.075) - 158.40;
      if (base <= 3751.05) return (base * 0.15) - 370.40;
      if (base <= 4664.68) return (base * 0.225) - 651.73;
      return (base * 0.275) - 884.96;
    };

    // Método de aproximação para encontrar o valor bruto
    let grossEstimate = liquid * 1.3; // Estimativa inicial
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

      // Ajusta a estimativa com base na diferença
      grossEstimate = grossEstimate * (liquid / calculatedLiquid);
      iterations++;
    }

    throw new Error("Não foi possível convergir para um valor preciso");
  };

  const handleCalculate = () => {
    const numericValue = parseFloat(liquidValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = calculateGrossValue(numericValue);
      setResult(result);
      toast({
        title: "Cálculo realizado com sucesso!",
        description: "Os valores foram calculados considerando a tabela IRRF 2024."
      });
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o valor bruto para o líquido informado.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Calculadora Salário Bruto 2024
          </h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="liquid" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Líquido Desejado
              </label>
              <Input
                id="liquid"
                type="text"
                placeholder="R$ 0,00"
                value={liquidValue}
                onChange={(e) => setLiquidValue(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Calcular Valor Bruto
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Resultado:</h2>
              <div className="grid gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Salário Bruto:</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(result.gross)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Desconto INSS:</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(result.inss)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Desconto IRRF:</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(result.irrf)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Salário Líquido:</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(result.liquid)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações</h2>
          <p className="text-sm text-gray-600">
            Esta calculadora utiliza as tabelas de IRRF e INSS vigentes em 2024 para realizar os cálculos.
            Os valores são aproximados e podem variar dependendo de outros fatores como dependentes e deduções específicas.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;