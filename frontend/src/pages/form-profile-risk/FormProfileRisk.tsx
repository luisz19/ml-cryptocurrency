
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { redirect, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components';
import { cn } from '@/lib/utils';
import { fetchAnswers, fetchQuestions, submitQuestionnaire } from '@/api/backend';

interface Question {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FormProfileRiskProps {
  mode?: 'edit';
}

const FormProfileRisk = ({ mode }: FormProfileRiskProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ profile: string; score: number } | null>(null);
  const navigate = useNavigate();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchQuestions(token)
      .then((qs) => {
        // Corrige o formato das perguntas para o frontend
        const mapped = qs.map((q: any) => ({
          name: q.id ? String(q.id) : q.question_text, // usa id como name
          label: q.question_text,
          options: Array.isArray(q.options)
            ? q.options.map((o: any) => ({ value: o.value, label: o.label }))
            : []
        }));
        setQuestions(mapped);
        setLoadingQuestions(false);
      })
      .catch(() => {
        setError('Erro ao buscar perguntas.');
        setLoadingQuestions(false);
      });

    fetchAnswers(token)
      .then((as) => {
        const defaultValues: Record<string, string> = {};
        as.forEach((a: any) => {
          defaultValues[String(a.question_id)] = a.selected_value;
        });
        reset(defaultValues);
      })
    
      .catch(() => {
        setError('Erro ao buscar respostas.');
        setLoadingQuestions(false);
      });

  }, [navigate]);

  const onSubmit = async (values: Record<string, string>) => {
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado.');
      return;
    }
    try {
      // Converte respostas para o formato esperado pelo backend
      const answers = Object.entries(values).map(([key, value]) => ({
        question_id: Number(key),
        selected_value: value
      }));
      const res = await submitQuestionnaire({ answers }, token);
      setResult({ profile: res.risk_level || res.profile, score: res.total_score || res.score });
      setTimeout(() => {
        if (mode === 'edit') {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar respostas.');
    }
  };

  if (loadingQuestions) {
    return (
      <section className="w-full flex justify-center px-4 py-12">
        <Card className="w-full max-w-2xl flex-col">
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin size-8" />
            <span className="ml-4">Carregando perguntas...</span>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full flex justify-center px-4 py-12">
      <Card className="w-full max-w-2xl flex-col">
        <CardContent>
          <div className="mb-10">
            <h1 className="text-xl md:text-2xl font-semibold leading-snug">Responda esse formulário para entendermos seu perfil de risco.</h1>
            <p className="text-sm text-muted-foreground mt-2">Investimentos alinhados ao seu perfil de risco</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {questions.length === 0 && (
              <p className="text-sm text-destructive">Nenhuma pergunta disponível. Tente novamente mais tarde.</p>
            )}
            {questions.map((p) => (
              <div key={p.name} className="space-y-2">
                <label className="text-xs font-medium tracking-wide block">{p.label}</label>
                {(Array.isArray(p.options) && p.options.length > 0) ? (
                  <Controller
                    name={p.name}
                    control={control}
                    rules={{ required: 'Selecione uma opção' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={cn('w-full', errors[p.name] && 'aria-invalid border-destructive')}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {p.options.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <p className="text-xs text-destructive mt-1">Opções não disponíveis para esta pergunta.</p>
                )}
                {errors[p.name] && <p className="text-xs text-destructive mt-1">{errors[p.name]?.message}</p>}
              </div>
            ))}

            {error && <p className="text-sm text-destructive mt-2">{error}</p>}

            {result && (
              <Card className="border-dashed mt-4">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Resultado</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Perfil:</span>
                    <span className="text-xs px-3 py-1 rounded-full border font-medium bg-[#99E39E]/15 text-[#99E39E] border-[#99E39E]/30">{result.profile}</span>
                  </div>
                  <span className="text-xs">Score: {result.score}</span>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-4 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => { reset(); setResult(null); navigate('/profile'); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#99E39E] text-black hover:bg-[#99E39E]/90">
                {isSubmitting && <Loader2 className="animate-spin size-4" />}
                {isSubmitting ? 'Processando...' : (mode === 'edit' ? 'Concluir' : 'Criar conta')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default FormProfileRisk;