//esse diabo ta funcionando, não mexer na logica
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes da Shadcn UI
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Por favor, preencha o campo Nome." }),
  phone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .pipe(z.string().min(10, { message: "O telefone deve ter no mínimo 10 dígitos (DDD + número)." }))
    .pipe(z.string().max(11, { message: "O telefone deve ter no máximo 11 dígitos (DDD + número)." })),
  email: z.string().email({ message: "Por favor, digite um email válido." }).optional().or(z.literal("")),
});

export function StudentLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; message: string | TrustedHTML } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setServerMessage(null);

    try {
      const normalizedPhone = "+55" + values.phone;

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: normalizedPhone,
          email: values.email || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.access_token;
        localStorage.setItem('accessToken', token);

        let successHtml = `<h4>✅ Login Bem-Sucedido!</h4>`;
        successHtml += `<p><strong>Status do Sistema:</strong> ${data.message}</p>`;

        if (data.curso) {
          successHtml += `<p><strong>Curso Realizado:</strong> ${data.curso}</p>`;
        } else {
          successHtml += `<p><strong>Próximo Passo:</strong> Prossiga para o questionário.</p>`;
        }

        setServerMessage({ type: 'success', message: successHtml });

      } else {
        const errorMessage = data.detail || "Erro desconhecido. Por favor, tente novamente.";
        setServerMessage({ type: 'error', message: `<h4>❌ Erro ao Acessar (${response.status})</h4><p>${errorMessage}</p>` });
      }

    } catch (error) {
      setServerMessage({ type: 'error', message: '<h4>❌ Erro de Conexão</h4><p>Não foi possível conectar ao servidor. Verifique se o backend está rodando.</p>' });
      console.error('Erro de rede:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center 
    bg-gradient-to-br from-[#188eee] to-[#24eaaf] p-4 font-['Inter',_sans-serif]">

      <div className="w-full max-w-md rounded-[7px] bg-white p-[40px] shadow-[10px_10px_40px_rgba(0,0,0,0.4)] space-y-[5px]">

        <h1 className="text-center text-[2.3em] font-medium mb-[10px]">Login</h1>
        <p className="text-center text-[14px] text-[#888888] mb-[20px]">Digite seus dados para acessar:</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[15px]">

            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[1em] font-semibold text-[#555]">Nome:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o seu nome completo"
                      {...field}
                      className="w-full rounded-[7px] border border-[#f0f0f0] p-[15px] 
                      text-[15px] text-[#555] outline-none focus:border-[#1a764b] 
                      focus:shadow-[0_0_10px_#1a764b]"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* Campo Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[1em] font-semibold text-[#555]">Telefone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      {...field}
                      className="w-full rounded-[7px] border border-[#f0f0f0] p-[15px] 
                      text-[15px] text-[#555] outline-none focus:border-[#1a764b] 
                      focus:shadow-[0_0_10px_#1a764b]"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* Campo Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[1em] font-semibold text-[#555]">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Digite o seu email"
                        {...field}
                        className="w-full rounded-[7px] border border-[#f0f0f0] p-[15px] pl-10 
                        text-[15px] text-[#555] outline-none focus:border-[#1a764b] 
                        focus:shadow-[0_0_10px_#1a764b]"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* Mensagens */}
            {serverMessage && (
              <div
                className={`mt-[20px] rounded-[5px] border p-[10px] text-center text-sm font-medium ${
                  serverMessage.type === 'success'
                    ? 'border-[#4CAF50] bg-[#e8f5e9] text-[#1b5e20]'
                    : 'border-[#f44336] bg-[#ffebee] text-[#b71c1c]'
                }`}
                dangerouslySetInnerHTML={{ __html: serverMessage.message }}
              />
            )}

            {/* Botão atualizado */}
            <Button
              type="submit"
              className="w-full cursor-pointer rounded-[7px] 
              bg-gradient-to-r from-[#188eee] to-[#24eaaf]
              py-[15px] px-[40px] text-center text-[1.25em] font-bold uppercase 
              text-white shadow-[0_5px_10px_rgba(0,0,0,0.4)] 
              transition-all hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Validando..." : "Acessar"}
            </Button>

          </form>
        </Form>

      </div>
    </div>
  );
}

export default StudentLogin;
