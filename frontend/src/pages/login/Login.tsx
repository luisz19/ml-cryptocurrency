import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Button,
  ThemeToggle,
} from "@/components";
import { login as loginApi } from "@/api/backend";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type FormValues = {
    email: string;
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      if (!values.email || !values.password)
        throw new Error("Preencha email e senha.");
      const res = await loginApi(values.email, values.password);
      localStorage.setItem("token", res.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center px-4 bg-card">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <Card className="w-full max-w-md bg-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">Olá, Bem vindo!</CardTitle>
          <CardDescription>
            Invista certo no mercado de acordo com seu Perfil de Risco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "Informe seu email.",
                  pattern: {
                    value:
                      /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                    message: "Email inválido.",
                  },
                })}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Informe sua senha.",
                  minLength: { value: 6, message: "Mínimo de 6 caracteres." },
                })}
              />
              {errors.password && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/register" className="font-medium hover:underline dark:text-primary">
              Cadastrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;