// src/components/ScaleQuestion.tsx

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScaleQuestionProps {
  question: string;
  onAnswer: (value: number) => void;
}

// 1. Aqui definimos as frases para CADA número
const scaleLabels: Record<number, string> = {
  0: "Não me identifico",
  1: "Muito pouco",
  2: "Pouco",
  3: "Moderadamente",
  4: "Bastante",
  5: "Me identifico totalmente"
};

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ question, onAnswer }) => {
  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardContent className="pt-0 px-0">
        {/* Pergunta */}
        <h3 className="text-xl md:text-2xl font-semibold text-center mb-10 text-foreground leading-relaxed">
          {question}
        </h3>

        {/* Container dos botões */}
        <div className="flex justify-between items-start gap-2 md:gap-4">
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex flex-col items-center gap-3 flex-1 group">
              
              {/* Botão Circular */}
              <Button
                variant="outline"
                className={cn(
                  "w-10 h-10 md:w-14 md:h-14 rounded-full text-base md:text-xl font-bold transition-all duration-200",
                  "border-2 border-muted-foreground/20 hover:border-primary hover:bg-primary/5 hover:text-primary hover:scale-110 active:scale-95"
                )}
                onClick={() => onAnswer(value)}
              >
                {value}
              </Button>
              
              {/* 2. Legenda (Agora visível para todos) */}
              <span className={cn(
                "text-[10px] md:text-xs text-center font-medium leading-tight transition-colors duration-200",
                // Destaque visual para os extremos (0 e 5) e cor suave para os outros
                value === 0 || value === 5 ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {scaleLabels[value]}
              </span>

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScaleQuestion;