// Substitua TODO o conteúdo do seu arquivo src/App.tsx por este:

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importando TODAS as páginas e o Header
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentLogin from "./pages/StudentLogin"; // Garanta que este arquivo exista em src/pages
import TestPage from "./pages/TestPage";       // Garanta que este arquivo exista em src/pages
import { Header } from "./components/Common/Header";

const queryClient = new QueryClient();

// Layout Padrão com Header (Moldura)
const MainLayout = () => (
  <>
    <Header />
    <main>
      <Outlet /> {/* Onde o conteúdo da página será inserido */}
    </main>
  </>
);

// Componente principal que define as rotas
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota da página de login (SEM Header) */}
          {/* O React Router verifica esta rota primeiro */}
          <Route path="/login" element={<StudentLogin />} />

          {/* Rotas que USAM o Header (definidas DENTRO do MainLayout) */}
          {/* Se a URL não for /login, ele usa esta estrutura */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} /> {/* Página Inicial */}
            <Route path="/teste" element={<TestPage />} /> {/* Página de Teste */}
            {/* Página de erro para URLs não encontradas DENTRO do layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;