import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ScaleQuestionProps {
  question: string;
  onAnswer: (value: number) => void;
  answered?: boolean;
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ question, onAnswer, answered = false }) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleScaleClick = (value: number) => {
    setSelectedValue(value);
    onAnswer(value);
  };

  const scaleOptions = [
    { value: 1, label: "Não me identifico" },
    { value: 2, label: "Me identifico pouco" },
    { value: 3, label: "Me identifico parcialmente" },
    { value: 4, label: "Me identifico bem" },
    { value: 5, label: "Me identifico muito" }
  ];

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border animate-fade-in">
      <h3 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
        {question}
      </h3>
      
      <div className="space-y-3">
        {scaleOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleScaleClick(option.value)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 
              flex items-center justify-between group
              animate-fade-in
              ${selectedValue === option.value
                ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                : 'bg-background border-border hover:border-primary hover:bg-accent'
              }
            `}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                font-semibold text-sm transition-all
                ${selectedValue === option.value
                  ? 'bg-primary-foreground text-primary border-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground group-hover:border-primary group-hover:text-primary'
                }
              `}>
                {option.value}
              </div>
              <span className={`
                text-left font-medium
                ${selectedValue === option.value
                  ? 'text-primary-foreground' 
                  : 'text-foreground'
                }
              `}>
                {option.label}
              </span>
            </div>
            
            {selectedValue === option.value && (
              <Check className="w-5 h-5 text-primary-foreground animate-scale-in" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScaleQuestion;