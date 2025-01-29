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
      
      if (base <= 2259.20) return 0;
      if (base <= 2826.65) return (base * 0.075) - 169.44;
      if (base <= 3751.05) return (base * 0.15) - 381.44;
      if (base <= 4664.68) return (base * 0.225) - 662.77;
      return (base * 0.275) - 896.00;
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
    <div className="min-h-screen bg-[#1A1F2C] bg-gradient-to-br from-[#1A1F2C] to-[#2C1A2F] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 bg-black/50 border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] mb-6">
            Calculadora Salário Bruto 2024
          </h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="liquid" className="block text-sm font-medium text-[#8B5CF6] mb-1">
                Valor Líquido Desejado
              </label>
              <Input
                id="liquid"
                type="text"
                placeholder="R$ 0,00"
                value={liquidValue}
                onChange={(e) => setLiquidValue(e.target.value)}
                className="w-full bg-black/30 border-[#8B5CF6]/50 text-white placeholder-gray-500 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7C3AED] hover:to-[#C026D3] text-white font-semibold shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
              Calcular Valor Bruto
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#8B5CF6]">Resultado:</h2>
              <div className="grid gap-3">
                <div className="p-4 bg-black/40 border border-[#8B5CF6]/30 rounded-lg shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <p className="text-sm text-[#8B5CF6]">Salário Bruto:</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.gross)}</p>
                </div>
                <div className="p-4 bg-black/40 border border-[#D946EF]/30 rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                  <p className="text-sm text-[#D946EF]">Desconto INSS:</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.inss)}</p>
                </div>
                <div className="p-4 bg-black/40 border border-[#D946EF]/30 rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                  <p className="text-sm text-[#D946EF]">Desconto IRRF:</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.irrf)}</p>
                </div>
                <div className="p-4 bg-black/40 border border-[#8B5CF6]/30 rounded-lg shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <p className="text-sm text-[#8B5CF6]">Salário Líquido:</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(result.liquid)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-black/50 border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[#8B5CF6] mb-4">Tabela IRRF 2024</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead>
                <tr className="border-b border-[#8B5CF6]/30">
                  <th className="py-2 px-4">Base de cálculo</th>
                  <th className="py-2 px-4">Alíquota</th>
                  <th className="py-2 px-4">Dedução</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#8B5CF6]/20">
                  <td className="py-2 px-4">Até R$ 2.259,20</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4">-</td>
                </tr>
                <tr className="border-b border-[#8B5CF6]/20">
                  <td className="py-2 px-4">De R$ 2.259,21 até R$ 2.826,65</td>
                  <td className="py-2 px-4">7,5%</td>
                  <td className="py-2 px-4">R$ 169,44</td>
                </tr>
                <tr className="border-b border-[#8B5CF6]/20">
                  <td className="py-2 px-4">De R$ 2.826,66 até R$ 3.751,05</td>
                  <td className="py-2 px-4">15,0%</td>
                  <td className="py-2 px-4">R$ 381,44</td>
                </tr>
                <tr className="border-b border-[#8B5CF6]/20">
                  <td className="py-2 px-4">De R$ 3.751,06 até R$ 4.664,68</td>
                  <td className="py-2 px-4">22,5%</td>
                  <td className="py-2 px-4">R$ 662,77</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Acima de R$ 4.664,68</td>
                  <td className="py-2 px-4">27,5%</td>
                  <td className="py-2 px-4">R$ 896,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;