import { Button, Card, Input } from "@/components";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, deleteUserAccount } from "@/api/backend";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const Profile = () => {

   type FormValues = {
    name: string;
    email: string;
  };

  const profileRiskMap: Record<string, string> = {
    alto: 'Agressivo',
    moderado: 'Moderado',
    baixo: 'Conservador',
  }

   const [isEditing, setIsEditing] = useState(false);
   const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; email: string; risk_profile?: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
   const navigate = useNavigate();

   const {
     register,
     handleSubmit,
     reset,
     formState: { errors, isSubmitting },
   } = useForm<FormValues>({
     defaultValues: { name: "", email: "" },
     mode: "onBlur",
   });

   useEffect(() => {
     const token = localStorage.getItem("token");
     if (!token) {
       navigate("/");
       return;
     }
     fetchUserProfile(token)
       .then((data) => {
         setProfile(data);
         reset({ name: data.name, email: data.email });
         setLoading(false);
       })
       .catch(() => {
         setLoading(false);
       });
   }, [navigate, reset]);

  const onSubmit = async (values: FormValues) => {
     try {
       const token = localStorage.getItem("token");
       if (!token) {
         navigate("/");
         return;
       }
       if (!profile) return;

       const updates: { name?: string; email?: string } = {};
       if (values.name && values.name !== profile.name) updates.name = values.name;
       if (values.email && values.email !== profile.email) updates.email = values.email;

       if (Object.keys(updates).length === 0) {
         setIsEditing(false);
         return;
       }

       const updated = await updateUserProfile(token, updates);
       setProfile(prev => prev ? { ...prev, name: updated.name ?? prev.name, email: updated.email ?? prev.email } : prev);
       reset({ name: updated.name, email: updated.email });
       setIsEditing(false);
     } catch (e) {
       console.error('Erro ao atualizar perfil:', e);
     }
   };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando perfil...</div>;
  }
  if (!profile) {
    return <div className="flex justify-center items-center h-full text-destructive">Erro ao carregar perfil.</div>;
  }
  return (
    <section className="p-4 h-full flex flex-col gap-4 justify-center">
      <div className="m-auto w-full max-w-6xl grid md:grid-cols-6 gap-4 justify-center">
      <Card className=" w-full md:col-span-2 flex flex-col h-[500px] items-center justify-center bg-sidebar-accent">
        <div className="w-[100px] h-[100px] rounded-full dark:bg-primary-foreground/50 bg-primary-foreground/60  "></div>
        <div className="flex flex-col items-center ">
          <h4 className="text-2xl">{profile.name}</h4>
          <span className="text-sm text-accent-foreground/60">{profile.email}</span>

          <div className="flex flex-col mt-3 items-center gap-1">
            <span className="text-xs text-accent-foreground/80">Perfil de risco:</span>
            <Badge variant="success">{(profile.risk_profile && profileRiskMap[profile.risk_profile.toLowerCase()]) || "Não definido"}</Badge>
          </div>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="p-5">Deletar Perfil</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deseja realmente deletar sua conta?</DialogTitle>
              <DialogDescription>
                Essa ação é irreversível. Seus dados e preferências serão removidos permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={deleting}>Cancelar</Button>
              </DialogClose>
              <Button type="button" variant="destructive" disabled={deleting}
                onClick={async () => {
                  try {
                    setDeleting(true);
                    const token = localStorage.getItem('token');
                    if (!token) { navigate('/'); return; }
                    await deleteUserAccount(token);
                    localStorage.removeItem('token');
                    setDeleteOpen(false);
                    navigate('/');
                  } catch (e) {
                    console.error('Erro ao deletar conta:', e);
                  } finally {
                    setDeleting(false);
                  }
                }}
              >{deleting ? 'Deletando...' : 'Deletar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      <Card className="col-span-4 p-6 md:p-8 flex flex-col justify-center gap-4 bg-sidebar-accent">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mx-auto w-full max-w-4xl px-2 md:px-4 lg:px-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input
              id="name"
              placeholder="Nome"
              className="dark:bg-primary-foreground"
              aria-invalid={!!errors.name}
              disabled={!isEditing}
              autoFocus={isEditing}
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

          {/* Campo de senha removido deste fluxo de edição. */}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { navigate('/form-profile-risk/edit') }}
            >
              Refazer formulário
            </Button>
            {isEditing ? (
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => { reset({ name: profile.name, email: profile.email }); setIsEditing(false); }}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>Salvar</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>Editar</Button>
            )}
          </div>
        </form>
      </Card>

      </div>
    </section>
  )
}

export default Profile