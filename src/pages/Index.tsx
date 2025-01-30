import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toggle } from "@/components/ui/toggle";
import { 
  calculateGrossFromNet, 
  calculateNetFromGross,
  calculateINSS,
  calculateIRRF 
} from "@/utils/salaryCalculations";

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
        calculationResult = {
          gross: numericValue,
          inss: calculateINSS(numericValue),
          irrf: calculateIRRF(numericValue, calculateINSS(numericValue)),
          liquid: calculateNetFromGross(numericValue)
        };
      } else {
        calculationResult = calculateGrossFromNet(numericValue);
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
    <div className="min-h-screen bg-gradient-to-br from-[#F1F0FB] to-[#E6E9F0] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 bg-white border-[#9b87f5]/30 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-[#403E43] mb-6">
            Calculadora Salarial 2024
          </h1>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <Toggle
                pressed={mode === "gross"}
                onPressedChange={() => setMode("gross")}
                className="data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white hover:bg-[#9b87f5]/80 text-[#403E43]"
              >
                Calcular Bruto → Líquido
              </Toggle>
              <Toggle
                pressed={mode === "net"}
                onPressedChange={() => setMode("net")}
                className="data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white hover:bg-[#9b87f5]/80 text-[#403E43]"
              >
                Calcular Líquido → Bruto
              </Toggle>
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-[#403E43] mb-1">
                {mode === "gross" ? "Valor Bruto" : "Valor Líquido"} Desejado
              </label>
              <Input
                id="value"
                type="text"
                placeholder="R$ 0,00"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white border-[#8E9196] text-[#403E43] placeholder-[#8E9196] focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-colors"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              className="w-full bg-[#9b87f5] hover:bg-[#8b76f4] text-white font-semibold shadow-md transition-all duration-300"
            >
              Calcular
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#403E43]">Resultado:</h2>
              <div className="grid gap-3">
                <div className="p-4 bg-white border border-[#9b87f5]/30 rounded-lg shadow-sm">
                  <p className="text-sm text-[#403E43]">Salário Bruto:</p>
                  <p className="text-xl font-bold text-[#403E43]">{formatCurrency(result.gross)}</p>
                </div>
                <div className="p-4 bg-white border border-[#9b87f5]/30 rounded-lg shadow-sm">
                  <p className="text-sm text-[#403E43]">Desconto INSS:</p>
                  <p className="text-xl font-bold text-[#403E43]">{formatCurrency(result.inss)}</p>
                </div>
                <div className="p-4 bg-white border border-[#9b87f5]/30 rounded-lg shadow-sm">
                  <p className="text-sm text-[#403E43]">Desconto IRRF:</p>
                  <p className="text-xl font-bold text-[#403E43]">{formatCurrency(result.irrf)}</p>
                </div>
                <div className="p-4 bg-white border border-[#9b87f5]/30 rounded-lg shadow-sm">
                  <p className="text-sm text-[#403E43]">Salário Líquido:</p>
                  <p className="text-xl font-bold text-[#403E43]">{formatCurrency(result.liquid)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white border-[#9b87f5]/30 shadow-lg backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[#403E43] mb-4">Tabela IRRF 2024</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#403E43]">
              <thead>
                <tr className="border-b border-[#9b87f5]/30">
                  <th className="py-2 px-4">Base de cálculo</th>
                  <th className="py-2 px-4">Alíquota</th>
                  <th className="py-2 px-4">Dedução</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#9b87f5]/20">
                  <td className="py-2 px-4">Até R$ 2.259,20</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4">-</td>
                </tr>
                <tr className="border-b border-[#9b87f5]/20">
                  <td className="py-2 px-4">De R$ 2.259,21 até R$ 2.826,65</td>
                  <td className="py-2 px-4">7,5%</td>
                  <td className="py-2 px-4">R$ 169,44</td>
                </tr>
                <tr className="border-b border-[#9b87f5]/20">
                  <td className="py-2 px-4">De R$ 2.826,66 até R$ 3.751,05</td>
                  <td className="py-2 px-4">15,0%</td>
                  <td className="py-2 px-4">R$ 381,44</td>
                </tr>
                <tr className="border-b border-[#9b87f5]/20">
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