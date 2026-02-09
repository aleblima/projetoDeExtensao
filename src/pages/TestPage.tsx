import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScaleQuestion from "@/components/ScaleQuestion";
import { Brain } from "lucide-react";

type IntelligenceType =
  | 'logicoMatematica'
  | 'linguistica'
  | 'espacial'
  | 'musical'
  | 'corporalCinestesica'
  | 'interpessoal'
  | 'intrapessoal'
  | 'naturalista'
  | 'existencial';

interface Question {
  id: number;
  text: string;
  category: IntelligenceType;
}

const categoryDisplayNames: Record<IntelligenceType, string> = {
  logicoMatematica: "Lógico-Matemática",
  linguistica: "Linguística",
  espacial: "Espacial",
  musical: "Musical",
  corporalCinestesica: "Corporal-Cinestésica",
  interpessoal: "Interpessoal",
  intrapessoal: "Intrapessoal",
  naturalista: "Naturalista",
  existencial: "Existencial"
};

// FASE 1 — perguntas iniciais
const initialQuestions: Question[] = [
  { id: 1, text: "Você tem facilidade para resolver problemas matemáticos e pensar logicamente?", category: 'logicoMatematica' },
  { id: 2, text: "Você gosta de ler, escrever ou se expressar verbalmente?", category: 'linguistica' },
  { id: 3, text: "Consegue visualizar objetos e espaços facilmente, tendo bom senso de orientação?", category: 'espacial' },
  { id: 4, text: "Tem interesse por música, aprecia tocar instrumentos ou cantar?", category: 'musical' },
  { id: 5, text: "Aprende melhor através do movimento, gosta de esportes, dança ou trabalhos manuais?", category: 'corporalCinestesica' },
  { id: 6, text: "Você se considera uma pessoa que entende bem as emoções e motiva os outros?", category: 'interpessoal' },
  { id: 7, text: "Prefere trabalhar sozinho, refletir sobre seus sentimentos e ter autoconhecimento?", category: 'intrapessoal' },
  { id: 8, text: "Tem interesse e facilidade para lidar com a natureza, plantas e animais?", category: 'naturalista' },
  { id: 9, text: "Costuma fazer perguntas profundas sobre a existência e busca sentido para a vida?", category: 'existencial' }
];

// FASE 2 — perguntas específicas
const specificQuestions: Record<IntelligenceType, string[]> = {
  logicoMatematica: [
    "Você prefere carreiras que envolvam cálculos, análise de dados ou raciocínio estratégico?",
    "Gostaria de trabalhar em áreas como engenharia, tecnologia, ciência ou finanças?",
    "Você se sente confortável lidando com orçamentos e projeções financeiras?",
    "Tem interesse em aprender linguagens de programação ou desenvolvimento de algoritmos?",
    "Gosta de investigar a causa raiz de problemas complexos e sistematizar soluções?",
    "Se vê trabalhando em laboratórios de pesquisa ou centros de análise estatística?"
  ],
  linguistica: [
    "Você se vê bem em profissões ligadas a comunicação, escrita, jornalismo ou direito?",
    "Pretende se especializar em ensino, tradução ou produção de conteúdo?",
    "Gosta da ideia de revisar textos, editar livros ou roteirizar vídeos?",
    "Tem facilidade para aprender novos idiomas e culturas?",
    "Se sente à vontade falando em público ou apresentando ideias para grupos?",
    "Gostaria de atuar na defesa de causas através de argumentos verbais ou escritos?"
  ],
  espacial: [
    "Tem interesse em design, arquitetura, engenharia civil ou artes visuais?",
    "Gostaria de atuar com planejamento urbano, animação digital ou fotografia?",
    "Você gosta de desenhar, pintar ou criar modelos tridimensionais?",
    "Tem facilidade para imaginar como ficaria a decoração de um ambiente vazio?",
    "Se interessa por pilotagem, navegação ou cartografia?",
    "Gostaria de trabalhar com criação de interfaces visuais para aplicativos ou sites?"
  ],
  musical: [
    "Você gostaria de trabalhar com composição, produção musical ou engenharia de som?",
    "Tem interesse em ensinar música ou teoria musical para outras pessoas?",
    "Se vê atuando em musicoterapia ou psicologia ligada à arte?",
    "Gostaria de trabalhar com curadoria musical ou crítica de arte?",
    "Tem interesse pela parte técnica de shows, como acústica e sonorização?",
    "Imagina-se gerenciando carreiras de artistas ou eventos musicais?"
  ],
  corporalCinestesica: [
    "Gostaria de trabalhar com educação física, fisioterapia ou esportes de alto rendimento?",
    "Tem interesse em artes cênicas, dança ou performance corporal?",
    "Prefere trabalhos manuais que exijam precisão, como cirurgia, odontologia ou artesanato?",
    "Gosta da ideia de construir ou consertar objetos e máquinas?",
    "Se vê trabalhando ao ar livre e em movimento constante, em vez de um escritório?",
    "Tem interesse em ergonomia e em como o corpo humano interage com objetos?"
  ],
  interpessoal: [
    "Gostaria de atuar em psicologia, recursos humanos ou assistência social?",
    "Tem interesse em vendas, negociação ou liderança de equipes?",
    "Se vê trabalhando com diplomacia, relações públicas ou política?",
    "Gosta da ideia de organizar eventos e gerenciar comunidades?",
    "Tem facilidade para mediar conflitos e encontrar soluções em grupo?",
    "Gostaria de ser professor ou mentor, guiando o desenvolvimento de outras pessoas?"
  ],
  intrapessoal: [
    "Gostaria de atuar como pesquisador, escritor ou filósofo?",
    "Tem interesse em psicologia clínica ou terapia focada no indivíduo?",
    "Prefere atuar como consultor autônomo, definindo seus próprios horários e metas?",
    "Gosta de planejar estratégias de longo prazo e trabalhar com metas pessoais?",
    "Se interessa por teologia ou estudos sobre espiritualidade?",
    "Gostaria de criar seu próprio negócio e empreender de forma independente?"
  ],
  naturalista: [
    "Gostaria de trabalhar com biologia, veterinária, agronomia ou zootecnia?",
    "Tem interesse em preservação ambiental, ecologia ou geologia?",
    "Se vê atuando em parques nacionais, reservas florestais ou oceanografia?",
    "Gosta da ideia de trabalhar com paisagismo ou jardinagem?",
    "Tem interesse em meteorologia ou estudo de fenômenos climáticos?",
    "Gostaria de pesquisar novas fontes de energia sustentável ou biotecnologia?"
  ],
  existencial: [
    "Gostaria de atuar em filosofia, teologia ou sociologia?",
    "Tem interesse em trabalhar com ONGs e causas humanitárias globais?",
    "Se vê atuando como conselheiro ético ou em comitês de bioética?",
    "Gosta de estudar história das religiões ou antropologia?",
    "Tem interesse em literatura clássica e análise de obras profundas?",
    "Gostaria de trabalhar com meditação, yoga ou práticas de bem-estar integral?"
  ]
};

const TestPage = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'initial' | 'specific'>('initial');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(initialQuestions.length).fill(0));
  const [scores, setScores] = useState<Record<string, number>>({});
  const [dominantIntelligence, setDominantIntelligence] = useState<IntelligenceType | null>(null);

  const handleAnswer = (value: number) => {

    if (phase === "initial") {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = value;
      setAnswers(newAnswers);

      const cat = initialQuestions[currentQuestionIndex].category;
      const newScores = { ...scores, [cat]: (scores[cat] || 0) + value };
      setScores(newScores);

      setTimeout(() => {
        if (currentQuestionIndex < initialQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          calculateDominantAndAdvance(newScores);
        }
      }, 400);
    }

    else if (phase === "specific" && dominantIntelligence) {
      const cat = dominantIntelligence;

      const newScores = { ...scores, [cat]: (scores[cat] || 0) + value };
      setScores(newScores);

      setTimeout(() => {
        const total = specificQuestions[cat].length;

        if (currentQuestionIndex < total - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {

          // -------------------------------
          // CHART COMPLETO (todas categorias)
          // -------------------------------
          const chartData = Object.entries(categoryDisplayNames).map(([key, label]) => {
            let color = "#3b82f6"; // azul padrão

            if (key === "logicoMatematica") {
              color = "#2563eb"; // azul forte (DESTAQUE)
            } else if (key === "corporalCinestesica") {
              color = "#f97316"; // laranja destaque
            }

            return {
              name: label,
              score: Math.min(100, Math.max(0, (newScores[key] || 0) * 10)),
              fill: color
            };
          });
            localStorage.setItem("scores", JSON.stringify(newScores));

          navigate("/resultado", {
            state: {
              answers,
              chartData,
              scores: newScores,
              dominantIntelligence
            }
          });
        }
      }, 400);
    }
  };

  const calculateDominantAndAdvance = (currentScores: Record<string, number>) => {
    let max = -1;
    let winner: IntelligenceType = "logicoMatematica";

    Object.entries(currentScores).forEach(([key, value]) => {
      if (value > max) {
        max = value;
        winner = key as IntelligenceType;
      }
    });

    setDominantIntelligence(winner);
    setPhase("specific");
    setCurrentQuestionIndex(0);
  };

  const formatCategoryName = (cat: string) =>
    cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="bg-background">
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl font-bold mb-4">Teste Vocacional</h2>

            <p>
              {phase === "initial"
                ? "Fase 1: Descobrindo suas aptidões principais."
                : `Fase 2: Explorando seu perfil ${formatCategoryName(dominantIntelligence || "")}.`}
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">

            {/* Barra de progresso */}
            <div className="w-full bg-muted rounded-full h-2 mb-8">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{
                  width:
                    phase === "initial"
                      ? `${((currentQuestionIndex + 1) / initialQuestions.length) * 100}%`
                      : `${(
                          (currentQuestionIndex + 1) /
                          (dominantIntelligence ? specificQuestions[dominantIntelligence].length : 1)
                        ) * 100}%`
                }}
              ></div>
            </div>

            <div className="text-center text-sm text-muted-foreground mb-4">
              Pergunta {currentQuestionIndex + 1}
            </div>

            <ScaleQuestion
              question={
                phase === "initial"
                  ? initialQuestions[currentQuestionIndex].text
                  : dominantIntelligence
                  ? specificQuestions[dominantIntelligence][currentQuestionIndex]
                  : ""
              }
              onAnswer={handleAnswer}
              key={`${phase}-${currentQuestionIndex}`}
            />
          </div>

        </div>
      </section>
    </div>
  );
};

export default TestPage;
