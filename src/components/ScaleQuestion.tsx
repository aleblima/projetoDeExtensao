import React, { useState } from 'react';

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

  const scaleLabels = [
    "Não me identifico",
    "Me identifico pouco", 
    "Me identifico parcialmente",
    "Me identifico",
    "Me identifico bem",
    "Me identifico bastante"
  ];

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border animate-fade-in">
      <h3 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
        {question}
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleScaleClick(i)}
              className={`
                w-12 h-12 rounded-full border-2 transition-all duration-200 font-semibold text-sm
                hover:scale-110 active:animate-scale-bounce
                ${selectedValue === i 
                  ? 'bg-scale-active border-scale-active text-white shadow-lg' 
                  : 'bg-background border-scale-inactive text-muted-foreground hover:border-primary hover:text-primary'
                }
              `}
            >
              {i}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="max-w-[80px] text-center leading-tight">
            {scaleLabels[0]}
          </span>
          <span className="max-w-[80px] text-center leading-tight">
            {scaleLabels[5]}
          </span>
        </div>
        
        {selectedValue !== null && (
          <div className="text-center pt-2">
            <span className="text-sm text-primary font-medium">
              {scaleLabels[selectedValue]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScaleQuestion;