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

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (import.meta.env.DEV) {
        console.debug("register submit", values);
      }
      navigate("/form-profile-risk");
    } finally {
      setLoading(false);
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="min-h-dvh grid place-items-center px-4 bg-card">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <Card className="w-full max-w-md bg-card  flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">Crie sua conta!</CardTitle>
          <CardDescription>
            Descubra as melhores criptomoedas para investir de acordo com seu Perfil de Risco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
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
                <p role="alert" className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Informe uma senha.",
                  minLength: { value: 6, message: "Mínimo de 6 caracteres." },
                })}
              />
              {errors.password && (
                <p role="alert" className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword", {
                  required: "Confirme sua senha.",
                  validate: (value) =>
                    value === passwordValue || "As senhas não conferem.",
                })}
              />
              {errors.confirmPassword && (
                <p role="alert" className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem conta? {" "}
            <Link to="/" className="font-medium hover:underline">Entrar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;