import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/services/api"; 

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

// ------------------------------------------
// VALIDAÇÃO DO FORMULÁRIO
// ------------------------------------------
const formSchema = z.object({
  name: z.string().min(1, { message: "Por favor, preencha o campo Nome." }),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .pipe(
      z
        .string()
        .min(10, { message: "O telefone deve ter no mínimo 10 dígitos." })
    )
    .pipe(
      z
        .string()
        .max(11, { message: "O telefone deve ter no máximo 11 dígitos." })
    ),
  email: z
    .string()
    .email({ message: "Digite um e-mail válido." })
    .optional()
    .or(z.literal("")),
});

// ------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------
export function StudentLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    message: string | TrustedHTML;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  // ------------------------------------------
  // SUBMIT DO FORMULÁRIO
  // ------------------------------------------
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setServerMessage(null);

    try {
      const normalizedPhone = "55" + values.phone;

      
      const response = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          phone: normalizedPhone,
          email: values.email || null,
        }),
      });
      const data = await response.json();
      localStorage.setItem("accessToken",data.token);
      localStorage.setItem("telefone",data.aluno.telefone);
      localStorage.setItem("nome",data.aluno.nome);
      localStorage.setItem("email",data.aluno.email);

      if (!response.ok) {
        setServerMessage({ type: "error", message: data.detail });
        setIsLoading(false);
        return;
      }

      // Salvar dados do usuário
      
      //CHECAGEM PARA SABER PRA ONDE REDIRECIONAR
      
      const check = await apiFetch(
        `/api/test_access?telefone=${normalizedPhone}`
      );

      const checkData = await check.json();
      console.log("DEBUG → checkData recebido:", checkData);

      if (checkData.curso) {
        navigate("/resultado", { state: { curso: checkData.curso } });}
      else {
        navigate("/teste");
}
    } catch (e) {
      setServerMessage({
        type: "error",
        message: "Erro inesperado ao conectar ao servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // ------------------------------------------
  // RENDERIZAÇÃO DA TELA
  // ------------------------------------------
  return (
    <div className="flex min-h-screen w-full items-center justify-center 
      bg-gradient-to-br from-[#188eee] to-[#24eaaf] p-4 font-['Inter',_sans-serif]">

      <div className="w-full max-w-md rounded-[7px] bg-white p-[40px] shadow-[10px_10px_40px_rgba(0,0,0,0.4)] space-y-[5px]">
        <h1 className="text-center text-[2.3em] font-medium mb-[10px]">Login</h1>
        <p className="text-center text-[14px] text-[#888888] mb-[20px]">
          Digite seus dados para acessar:
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[15px]">

            {/* Nome */}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* Telefone */}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* Email */}
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
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-600" />
                </FormItem>
              )}
            />

            {/* MENSAGEM DO SERVIDOR */}
            {serverMessage && (
              <div
                className={`mt-[20px] rounded-[5px] border p-[10px] text-center text-sm font-medium ${
                  serverMessage.type === "success"
                    ? "border-green-500 bg-green-100 text-green-700"
                    : "border-red-500 bg-red-100 text-red-700"
                }`}
                dangerouslySetInnerHTML={{ __html: serverMessage.message }}
              />
            )}

            {/* BOTÃO */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#188eee] to-[#24eaaf]"
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
