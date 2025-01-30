import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toggle } from "@/components/ui/toggle";
import { calculateGrossFromNet, calculateNetFromGross } from "@/utils/salaryCalculations";

const Index = () => {
  const [mode, setMode] = useState<"gross" | "net">("gross");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<{
    gross: number;
    inss: number;
    irrf: number;
    liquid: number;
  } | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const numericValue = parseFloat(inputValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    try {
      let calculationResult;
      if (mode === "gross") {
        calculationResult = calculateGrossFromNet(numericValue);
      } else {
        const netValue = calculateNetFromGross(numericValue);
        calculationResult = {
          gross: numericValue,
          inss: calculateINSS(numericValue),
          irrf: calculateIRRF(numericValue, calculateINSS(numericValue)),
          liquid: netValue
        };
      }
      
      setResult(calculationResult);
      toast({
        title: "Cálculo realizado com sucesso!",
        description: "Os valores foram calculados considerando a tabela IRRF 2024."
      });
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível realizar o cálculo para o valor informado.",
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
            Calculadora Salarial 2024
          </h1>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <Toggle
                pressed={mode === "gross"}
                onPressedChange={() => setMode("gross")}
                className="data-[state=on]:bg-[#8B5CF6] data-[state=on]:text-white"
              >
                Calcular Bruto → Líquido
              </Toggle>
              <Toggle
                pressed={mode === "net"}
                onPressedChange={() => setMode("net")}
                className="data-[state=on]:bg-[#D946EF] data-[state=on]:text-white"
              >
                Calcular Líquido → Bruto
              </Toggle>
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-[#8B5CF6] mb-1">
                {mode === "gross" ? "Valor Bruto" : "Valor Líquido"} Desejado
              </label>
              <Input
                id="value"
                type="text"
                placeholder="R$ 0,00"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-black/30 border-[#8B5CF6]/50 text-white placeholder-gray-500 focus:border-[#D946EF] focus:ring-[#D946EF] transition-colors"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7C3AED] hover:to-[#C026D3] text-white font-semibold shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
              Calcular
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
