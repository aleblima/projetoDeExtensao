import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScaleQuestion from "@/components/ScaleQuestion";
import { Award, Brain, ArrowRight, CheckCircle2 } from "lucide-react";

// --- Definição das Perguntas e Tipos ---

type IntelligenceType = 
  | 'logico_matematica' 
  | 'linguistica' 
  | 'espacial' 
  | 'musical' 
  | 'corporal_cinestesica' 
  | 'interpessoal' 
  | 'intrapessoal' 
  | 'naturalista' 
  | 'existencial';

interface Question {
  id: number;
  text: string;
  category: IntelligenceType;
}

// Perguntas da Fase 1: Identificar Áreas de Aptidão
const initialQuestions: Question[] = [
  { id: 1, text: "Você tem facilidade para resolver problemas matemáticos e pensar logicamente?", category: 'logico_matematica' },
  { id: 2, text: "Você gosta de ler, escrever ou se expressar verbalmente?", category: 'linguistica' },
  { id: 3, text: "Consegue visualizar objetos e espaços facilmente, tendo bom senso de orientação?", category: 'espacial' },
  { id: 4, text: "Tem interesse por música, aprecia tocar instrumentos ou cantar?", category: 'musical' },
  { id: 5, text: "Aprende melhor através do movimento, gosta de esportes, dança ou trabalhos manuais?", category: 'corporal_cinestesica' },
  { id: 6, text: "Você se considera uma pessoa que entende bem as emoções e motiva os outros?", category: 'interpessoal' },
  { id: 7, text: "Prefere trabalhar sozinho, refletir sobre seus sentimentos e ter autoconhecimento?", category: 'intrapessoal' },
  { id: 8, text: "Tem interesse e facilidade para lidar com a natureza, plantas e animais?", category: 'naturalista' },
  { id: 9, text: "Costuma fazer perguntas profundas sobre a existência e busca sentido para a vida?", category: 'existencial' }
];

// Perguntas da Fase 2: Filtro de Profissão (6 perguntas por área para totalizar 15)
const specificQuestions: Record<IntelligenceType, string[]> = {
  logico_matematica: [
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
  corporal_cinestesica: [
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
  // Estados do Teste
  const [phase, setPhase] = useState<'initial' | 'specific' | 'result'>('initial');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Armazena pontuações: { logico_matematica: 15, linguistica: 10, ... }
  const [scores, setScores] = useState<Record<string, number>>({});
  
  // Armazena a inteligência predominante identificada na Fase 1
  const [dominantIntelligence, setDominantIntelligence] = useState<IntelligenceType | null>(null);

  // Função para lidar com a resposta (1 a 5)
  const handleAnswer = (value: number) => {
    if (phase === 'initial') {
      // Lógica da Fase 1
      const currentCategory = initialQuestions[currentQuestionIndex].category;
      
      setScores(prev => ({
        ...prev,
        [currentCategory]: (prev[currentCategory] || 0) + value
      }));

      setTimeout(() => {
        if (currentQuestionIndex < initialQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          calculateDominantAndAdvance();
        }
      }, 400);

    } else if (phase === 'specific') {
      // Lógica da Fase 2 (Apenas avança, pois é um filtro de confirmação)
      // Aqui poderíamos armazenar respostas específicas se necessário
      setTimeout(() => {
        const totalSpecific = dominantIntelligence ? specificQuestions[dominantIntelligence].length : 0;
        if (currentQuestionIndex < totalSpecific - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setPhase('result');
        }
      }, 400);
    }
  };

  // Calcula qual categoria venceu e avança para a Fase 2
  const calculateDominantAndAdvance = () => {
    let maxScore = -1;
    let winner: IntelligenceType = 'logico_matematica'; // Default

    // Encontra a maior pontuação
    (Object.keys(scores) as IntelligenceType[]).forEach(key => {
      if (scores[key] > maxScore) {
        maxScore = scores[key];
        winner = key;
      }
    });

    setDominantIntelligence(winner);
    setPhase('specific');
    setCurrentQuestionIndex(0); // Reseta o índice para as perguntas específicas
  };

  const resetTest = () => {
    setPhase('initial');
    setCurrentQuestionIndex(0);
    setScores({});
    setDominantIntelligence(null);
  };

  // Renderização dos nomes amigáveis das áreas
  const formatCategoryName = (cat: string) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-background">
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Cabeçalho do Teste */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Teste Vocacional</h2>
            <p className="text-muted-foreground">
              {phase === 'initial' 
                ? "Fase 1: Descobrindo suas aptidões principais." 
                : phase === 'specific' 
                ? `Fase 2: Explorando seu perfil ${formatCategoryName(dominantIntelligence || '')}.`
                : "Resultado da sua análise."}
            </p>
          </div>

          {/* Conteúdo do Teste */}
          {phase !== 'result' ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Barra de Progresso Simples */}
              <div className="w-full bg-muted rounded-full h-2 mb-8">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: phase === 'initial' 
                      ? `${((currentQuestionIndex + 1) / initialQuestions.length) * 100}%`
                      : `${((currentQuestionIndex + 1) / 6) * 100}%` // 6 perguntas na fase 2
                  }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground mb-4">
                {phase === 'initial' ? 'Avaliação Geral' : 'Filtro de Especialização'} • Pergunta {currentQuestionIndex + 1}
              </div>

              {/* Renderiza a Pergunta Atual */}
              <ScaleQuestion
                question={
                  phase === 'initial' 
                    ? initialQuestions[currentQuestionIndex].text 
                    : (dominantIntelligence ? specificQuestions[dominantIntelligence][currentQuestionIndex] : "")
                }
                onAnswer={handleAnswer}
                // A key força o componente a "remontar" quando a pergunta muda, resetando animações
                key={`${phase}-${currentQuestionIndex}`}
              />
            </div>
          ) : (
            // Tela de Resultado
            <Card className="max-w-2xl mx-auto text-center border-t-4 border-primary shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                  <Award className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl mb-2">Análise Concluída!</CardTitle>
                <CardDescription className="text-lg">
                  Identificamos que o seu perfil predominante é:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 rounded-xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Inteligência {formatCategoryName(dominantIntelligence || '')}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Você demonstrou uma forte aptidão nesta área durante a triagem inicial e confirmou seus interesses através do filtro de especialização. Profissões que valorizam essa competência tendem a trazer maior satisfação e sucesso para você.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={resetTest} variant="outline" className="w-full sm:w-auto">
                    Refazer Teste
                  </Button>
                  <Button className="w-full sm:w-auto gap-2">
                    Ver Cursos Relacionados <ArrowRight className="w-4 h-4"/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default TestPage;