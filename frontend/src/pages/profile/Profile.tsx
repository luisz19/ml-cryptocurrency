import { Button, Card, Input } from "@/components";
import { useForm } from "react-hook-form";
import { useState } from "react";

const Profile = () => {

   type FormValues = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

   const defaultValues: FormValues = {
     name: "Ester Alves",
     email: "e.alves@example.com",
     password: "********",
     confirmPassword: "********",
   };

   const [isEditing, setIsEditing] = useState(false);

   const {
     register,
     handleSubmit,
     reset,
     watch,
     formState: { errors, isSubmitting },
   } = useForm<FormValues>({
     defaultValues,
     mode: "onBlur",
   });

   const onSubmit = async (values: FormValues) => {
     await new Promise((r) => setTimeout(r, 10000));
     if (import.meta.env.DEV) {
       console.debug("profile submit", values);
     }
     setIsEditing(false);
   };

  return (
    <section className="grid md:grid-cols-6 gap-4 p-4 ">
      <Card className="col-span-2 flex flex-col h-[500px] items-center justify-center bg-sidebar-accent">
        <div className="w-[100px] h-[100px] rounded-full dark:bg-primary-foreground/50 bg-primary-foreground/60  "></div>
        <div className="flex flex-col items-center">
          <h4 className="text-2xl">Ester Alves</h4>
          <span className="text-sm text-accent-foreground/60">e.alves@example.com</span>
          <span>Moderado</span>
        </div>

        <Button variant="destructive" className="p-5">Deletar Perfil</Button>

      </Card>

      <Card className="col-span-4 p-4 flex flex-col justify-center gap-4 bg-sidebar-accent">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input
              id="name"
              placeholder="Nome"
              className="dark:bg-primary-foreground"
              aria-invalid={!!errors.name}
              disabled={!isEditing}
              readOnly={!isEditing}
              {...register("name", { required: isEditing ? "Informe seu nome." : false })}
            />
            {errors.name && (
              <p role="alert" className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              className="dark:bg-primary-foreground"
              placeholder="Email"
              aria-invalid={!!errors.email}
              disabled={!isEditing}
              readOnly={!isEditing}
              {...register("email", {
                required: isEditing ? "Informe seu email." : false,
                pattern: isEditing
                  ? { value: /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                      message: "Email inválido." }
                  : undefined,
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
              className="dark:bg-primary-foreground"
              placeholder="Senha"
              aria-invalid={!!errors.password}
              disabled={!isEditing}
              readOnly={!isEditing}
              {...register("password", isEditing ? {
                required: "Informe a senha.",
                minLength: { value: 6, message: "Mínimo de 6 caracteres." },
              } : {})}
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
              className="dark:bg-primary-foreground"
              placeholder="Confirmar Senha"
              aria-invalid={!!errors.confirmPassword}
              disabled={!isEditing}
              readOnly={!isEditing}
              {...register("confirmPassword", isEditing ? {
                required: "Confirme a senha.",
                validate: (v) => v === watch("password") || "As senhas não conferem.",
              } : {})}
            />
            {errors.confirmPassword && (
              <p role="alert" className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(defaultValues); setIsEditing(false); }}
            >
              Refazer formulário
            </Button>
            {isEditing ? (
              <Button type="submit" disabled={isSubmitting}>Salvar</Button>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>Editar</Button>
            )}
          </div>
        </form>
      </Card>



    </section>
  )
}

export default Profile