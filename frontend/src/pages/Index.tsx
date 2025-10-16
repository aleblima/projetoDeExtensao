import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScaleQuestion from "@/components/ScaleQuestion";
import { BookOpen, TrendingUp, Users, Award, Brain, Target, Menu, X, Home, Info, HelpCircle } from "lucide-react";

const Index = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const testSectionRef = React.useRef<HTMLElement>(null);
  const aboutSectionRef = React.useRef<HTMLElement>(null);

  const questions = [
    "Gosto de trabalhar com números e cálculos matemáticos complexos",
    "Prefiro atividades que envolvem criatividade e expressão artística",
    "Me sinto confortável liderando grupos e tomando decisões importantes",
    "Tenho interesse em compreender como as coisas funcionam tecnicamente",
    "Gosto de ajudar outras pessoas a resolver seus problemas",
    "Me interesso por questões relacionadas à saúde e bem-estar",
    "Prefiro trabalhos que me permitam estar em contato com a natureza",
    "Tenho facilidade para me comunicar e persuadir outras pessoas",
    "Me sinto motivado por desafios que envolvem análise e pesquisa",
    "Gosto de atividades que exigem precisão e atenção aos detalhes"
  ];

  const popularCourses = [
    { name: "Medicina", icon: "🏥", growth: "+15%" },
    { name: "Engenharia", icon: "⚙️", growth: "+12%" },
    { name: "Direito", icon: "⚖️", growth: "+8%" },
    { name: "Psicologia", icon: "🧠", growth: "+20%" },
    { name: "Administração", icon: "💼", growth: "+10%" }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }, 500);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const scrollToTest = () => {
    testSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateResults = () => {
    const total = answers.reduce((sum, answer) => sum + answer, 0);
    const average = total / answers.length;
    
    if (average >= 4) return "Alto interesse vocacional";
    if (average >= 2.5) return "Interesse vocacional moderado"; 
    return "Baixo interesse vocacional";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">TestVocacional</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={scrollToHome}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                Início
              </button>
              <button 
                onClick={scrollToAbout}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="w-4 h-4" />
                Sobre
              </button>
              <button 
                onClick={scrollToTest}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Teste
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    scrollToHome();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <Home className="w-4 h-4" />
                  Início
                </button>
                <button 
                  onClick={() => {
                    scrollToAbout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <Info className="w-4 h-4" />
                  Sobre
                </button>
                <button 
                  onClick={() => {
                    scrollToTest();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Teste
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-gradient-hero py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-8">
            <Card className="max-w-lg bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Teste Vocacional Online
                </CardTitle>
                <CardDescription className="text-lg">
                  Descubra suas aptidões e encontre a carreira ideal para você
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Um teste científico desenvolvido para ajudar você a identificar suas 
                  habilidades naturais e interesses profissionais.
                </p>
                <div className="flex justify-center gap-6 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span>10 Perguntas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-secondary" />
                    <span>Resultado Imediato</span>
                  </div>
                </div>
                <Button onClick={scrollToTest} className="w-full">
                  Começar Teste
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section ref={aboutSectionRef} className="py-16 px-4 bg-test-bg">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Importance Card */}
            <Card className="h-full bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">Por que fazer um teste vocacional?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  O teste vocacional é uma ferramenta essencial para quem busca clareza 
                  sobre sua carreira profissional.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Identifica suas habilidades naturais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Reduz ansiedade na escolha profissional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Orienta decisões acadêmicas importantes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Aumenta chances de satisfação profissional</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Popular Courses Card */}
            <Card className="h-full bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl">Cursos Mais Pesquisados</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Veja quais cursos estão em alta no mercado de trabalho:
                </p>
                <div className="space-y-3">
                  {popularCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <span className="font-medium">{course.name}</span>
                      </div>
                      <span className="text-sm text-secondary font-semibold">
                        {course.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Test Section */}
      <section ref={testSectionRef} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Teste Vocacional</h2>
            <p className="text-muted-foreground">
              Responda as perguntas de acordo com o quanto você se identifica com cada afirmação
            </p>
          </div>

          {!showResults ? (
            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
              </div>

              <ScaleQuestion
                question={questions[currentQuestion]}
                onAnswer={handleAnswer}
                key={currentQuestion}
              />
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Teste Concluído!</CardTitle>
                <CardDescription>
                  Aqui está o seu resultado baseado nas suas respostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-test-bg rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {calculateResults()}
                  </h3>
                  <p className="text-muted-foreground">
                    Suas respostas indicam um padrão específico de interesses e aptidões. 
                    Recomendamos buscar orientação profissional para um resultado mais detalhado.
                  </p>
                </div>
                <Button onClick={resetTest} className="w-full">
                  Refazer Teste
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;