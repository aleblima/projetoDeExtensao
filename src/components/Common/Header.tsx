import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X, Home, Info, HelpCircle, LogIn } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Links de navegação - ajuste os caminhos conforme necessário
  const navLinks = [
    { name: 'Início', path: '/', icon: Home },
    // { name: 'Sobre', path: '/sobre', icon: Info }, 
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Container que define a largura máxima do conteúdo do header */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo e Nome do Site */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Teste Vocacional</span>
          </Link>

          {/* Navegação para Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                // Estilo para link ativo e inativo
                className={({ isActive }) =>
                  `flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-foreground font-medium' // Cor do link ativo
                      : 'text-muted-foreground hover:text-foreground' // Cor do link inativo
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </NavLink>
            ))}
            {/* Link para a página de Login */}
            <Link
              to="/login" // Rota definida no App.tsx
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </nav>

          {/* Botão para abrir/fechar menu mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {/* Mostra ícone X se o menu estiver aberto, senão mostra Menu */}
              {isMenuOpen ? <X /> : <Menu />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>

        {/* Menu Mobile Dropdown (só aparece se isMenuOpen for true) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
                  // Estilo para link ativo e inativo no mobile
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 ${
                      isActive
                        ? 'text-foreground bg-accent rounded-md' // Estilo do link ativo
                        : 'text-muted-foreground hover:text-foreground' // Estilo do link inativo
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              ))}
              {/* Link de Login no mobile */}
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}