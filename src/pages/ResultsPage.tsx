import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Award, Brain, ArrowLeft } from "lucide-react";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as any | undefined;
  const incomingAnswers = Array.isArray(state?.answers) ? state.answers : undefined;
  const incomingChart = Array.isArray(state?.chartData) ? state.chartData : undefined;
  const incomingScoresObj =
    state?.scores && typeof state.scores === "object" ? state.scores : undefined;

  const [professions, setProfessions] = useState("");


  useEffect(() => {
    if (!incomingScoresObj) return;

    const sorted = Object.entries(incomingScoresObj)
      .map(([key, value]) => ({ key, score: value as number }))
      .sort((a, b) => b.score - a.score);

    if (sorted.length === 0) return;

    const cursoFinal = sorted[0].key;

    const salvarResultado = async () => {
      try {
        await fetch("https://backend-para-deploy.onrender.com/api/submit_results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            telefone: localStorage.getItem("telefone"),
            curso: cursoFinal
          })
        });
      } catch (error) {
        console.error("Erro ao salvar resultado:", error);
      }
    };

    salvarResultado();
  }, []);



  const categories = [
    { name: "Lógico-Matemática", key: "logicoMatematica", initialQuestions: [1]},
    { name: "Linguística", key: "linguistica", initialQuestions: [2] },
    { name: "Espacial", key: "espacial", initialQuestions: [3] },
    { name: "Musical", key: "musical", initialQuestions: [4] },
    { name: "Corporal-Cinestésica", key: "corporalCinestesica", initialQuestions: [5] },
    { name: "Interpessoal", key: "interpessoal", initialQuestions: [6] },
    { name: "Intrapessoal", key: "intrapessoal", initialQuestions: [7] },
    { name: "Naturalista", key: "naturalista", initialQuestions: [8] },
    { name: "Existencial", key: "existencial", initialQuestions: [9] }
  ];

  const normalizeKey = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "")
      .toLowerCase();

  const chartData = (() => {
    if (incomingChart) {
      return incomingChart.map((c) => ({
        name: c.name,
        score: Math.round(c.score),
        key: normalizeKey(c.name)
      }));
    }

    if (incomingScoresObj) {
      return categories.map((cat) => {
        const score = incomingScoresObj[cat.key] || incomingScoresObj[cat.name] || 0;
        return {
          name: cat.name,
          score: Math.min(100, Math.max(0, Math.round(score))),
          key: cat.key
        };
      });
    }

    return categories.map((cat) => {
      const total = cat.initialQuestions.reduce(
        (acc, idx) => acc + (incomingAnswers?.[idx] || 0),
        0
      );
      const avg = total / cat.initialQuestions.length;
      return {
        name: cat.name,
        score: Math.min(100, Math.max(0, Math.round(avg * 20))),
        key: cat.key
      };
    });
  })();

  const sortedCategories = [...chartData].sort((a, b) => b.score - a.score);
  const topCategories = sortedCategories.slice(0, 3);

  const professionMap: Record<string, string[]> = {
    logicoMatematica: [
      "Cientista de Dados",
      "Engenheiro",
      "Analista de Dados",
      "Programador",
      "Matemático",
      "Estatístico",
      "Arquiteto de Software"
    ],
    linguistica: [
      "Jornalista",
      "Copywriter",
      "Tradutor",
      "Escritor",
      "Professor de Línguas",
      "Revisor",
      "Roteirista"
    ],
    espacial: [
      "Arquiteto",
      "Designer Gráfico",
      "Engenheiro Civil",
      "Urbanista",
      "Piloto",
      "Designer de Interiores",
      "Fotógrafo"
    ],
    musical: [
      "Produtor Musical",
      "Instrumentista",
      "Compositor",
      "Maestro",
      "Musicoterapeuta",
      "Engenheiro de Som",
      "Crítico Musical"
    ],
    corporalCinestesica: [
      "Fisioterapeuta",
      "Ator/Dançarino",
      "Educador Físico",
      "Cirurgião",
      "Atleta Profissional",
      "Coreógrafo",
      "Artista de Performance"
    ],
    interpessoal: [
      "Psicólogo",
      "RH",
      "Professor",
      "Assistente Social",
      "Vendedor",
      "Politico",
      "Mediador de Conflitos"
    ],
    intrapessoal: [
      "Terapeuta",
      "Filósofo",
      "Escritor",
      "Pesquisador",
      "Consultor",
      "Coach",
      "Empreendedor"
    ],
    naturalista: [
      "Biólogo",
      "Ambientalista",
      "Agrônomo",
      "Veterinário",
      "Geólogo",
      "Oceanógrafo",
      "Paisagista"
    ],
    existencial: [
      "Filósofo",
      "Teólogo",
      "Pesquisador",
      "Conselheiro Espiritual",
      "Antropólogo",
      "Sociólogo",
      "Escritor de Não-Ficção"
    ]
  };

  useEffect(() => {
    const text = topCategories
      .map((cat, i) => {
        const key = normalizeKey(cat.name);
        const list = professionMap[key] || professionMap[cat.key] || ["Profissões relacionadas à área"];
        return `${i + 1}. ${cat.name} (${cat.score}% de compatibilidade):\n   - ${list.join(
          "\n   - "
        )}`;
      })
      .join("\n\n");

    setProfessions(text);
  }, [topCategories]);

  const categoryColors: Record<string, string> = {
    logicoMatematica: " hsl(220, 90%, 56%) ", //Azul
    linguistica: "hsl(280, 65%, 60%)", //Roxo
    espacial: "hsl(25, 95%, 53%)",//Laranja
    musical: "hsl(160, 84%, 39%)", //
    corporalCinestesica: "hsl(340, 75%, 55%)", //Rosa
    interpessoal: "hsl(142, 71%, 45%)", // Verde
    intrapessoal: "hsl(84, 65%, 50%)", //Lima
    naturalista: "hsl(200, 92%, 48%)",// Ciano
    existencial: "hsl(262, 52%, 47%)" // Roxo escuro
  };

  const getCategoryColor = (categoryName: string, categoryKey?: string) => {
    const key = categoryKey || normalizeKey(categoryName);
    return categoryColors[key] || "hsl(var(--muted))";
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">TestVocacional</span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Início
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-3xl">Resultados do Teste Vocacional</CardTitle>
              <CardDescription>
                Veja suas pontuações por área e profissões sugeridas
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Gráfico */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Pontuação por Área</h3>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedCategories}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={12}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Pontuação']}
                        labelFormatter={(label) => `Área: ${label}`}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {sortedCategories.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={getCategoryColor(entry.name, entry.key)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 3 */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Top 3 Áreas com Maior Compatibilidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {topCategories.map((category, index) => (
                    <Card key={index} className="text-center">
                      <CardHeader className="pb-2">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2`}
                             style={{ backgroundColor: getCategoryColor(category.name, category.key) }}>
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.score}% de compatibilidade</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Profissões */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Profissões Recomendadas</h3>
                <Textarea
                  value={professions}
                  readOnly
                  className="min-h-[300px] font-mono text-sm leading-relaxed"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Baseado nas suas áreas de maior aptidão, estas são as profissões que melhor se alinham com seu perfil.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <Button 
                  onClick={() => navigate("/teste")} 
                  variant="outline" 
                  className="flex-1"
                >
                  Refazer Teste
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  className="flex-1"
                >
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ResultsPage;
