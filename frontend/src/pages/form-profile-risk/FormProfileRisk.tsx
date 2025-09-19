import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components';
import { cn } from '@/lib/utils';

type FormValues = {
  horizon: string;
  dropReaction: string;
  knowledge: string;
  goal: string;
  allocation: string;
};

const questions: { name: keyof FormValues; label: string; options: { value: string; label: string; score: number }[] }[] = [
  {
    name: 'horizon',
    label: 'Qual o seu horizonte de investimento em criptomoedas?',
    options: [
      { value: 'short', label: 'Curto prazo (até 6 meses)', score: 1 },
      { value: 'medium', label: 'Médio prazo (6 meses a 2 anos)', score: 2 },
      { value: 'long', label: 'Longo prazo (mais de 2 anos)', score: 3 },
    ],
  },
  {
    name: 'dropReaction',
    label: 'Se o valor cair 20% em uma semana, o que você faria?',
    options: [
      { value: 'sell', label: 'Vender tudo imediatamente', score: 1 },
      { value: 'hold', label: 'Manter parte e observar', score: 2 },
      { value: 'buyMore', label: 'Comprar mais (aproveitar a queda)', score: 3 },
    ],
  },
  {
    name: 'knowledge',
    label: 'Qual o seu nível de conhecimento sobre investimentos?',
    options: [
      { value: 'beginner', label: 'Nenhum ou iniciante', score: 1 },
      { value: 'intermediate', label: 'Já invisto em outras classes', score: 2 },
      { value: 'advanced', label: 'Tenho experiência com cripto/trading', score: 3 },
    ],
  },
  {
    name: 'goal',
    label: 'Qual é o seu principal objetivo com criptomoedas?',
    options: [
      { value: 'protect', label: 'Proteger capital', score: 1 },
      { value: 'grow', label: 'Crescer gradualmente', score: 2 },
      { value: 'maximize', label: 'Máximo retorno possível', score: 3 },
    ],
  },
  {
    name: 'allocation',
    label: 'Qual percentual do patrimônio investiria em criptomoedas?',
    options: [
      { value: 'upto10', label: 'Até 10%', score: 1 },
      { value: '10to30', label: 'De 10% a 30%', score: 2 },
      { value: 'over30', label: 'Mais de 30%', score: 3 },
    ],
  },
];

function classifyRisk(score: number) {
  const max = questions.length * 3; // 15
  const pct = score / max;
  if (pct < 0.4) return { level: 'Conservador', color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30' };
  if (pct < 0.7) return { level: 'Moderado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  return { level: 'Agressivo', color: 'bg-[#99E39E]/15 text-[#99E39E] border-[#99E39E]/30' };
}

interface FormProfileRiskProps {
  mode?: 'edit';
}

const FormProfileRisk = ({ mode }: FormProfileRiskProps) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      horizon: '', dropReaction: '', knowledge: '', goal: '', allocation: ''
    }
  });
  const [result, setResult] = useState<{ level: string; score: number } | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (values: FormValues) => {
    let score = 0;
    questions.forEach(p => {
      const opt = p.options.find(o => o.value === values[p.name]);
      if (opt) score += opt.score;
    });
    const r = classifyRisk(score);
    setResult({ level: r.level, score });
 
    await new Promise(res => setTimeout(res, 4000));
    if (mode === 'edit') {
      navigate('/profile');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <section className="w-full flex justify-center px-4 py-12">
      <Card className="w-full max-w-2xl flex-col">
        <CardContent>
          <div className="mb-10">
            <h1 className="text-xl md:text-2xl font-semibold leading-snug">Responda esse formulário para entendermos seu perfil de risco.</h1>
            <p className="text-sm text-muted-foreground mt-2">Investimentos alinhados ao seu perfil de risco</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {questions.map((p) => (
              <div key={p.name} className="space-y-2">
                <label className="text-xs font-medium tracking-wide block">{p.label}</label>
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
                {errors[p.name] && <p className="text-xs text-destructive mt-1">{errors[p.name]?.message}</p>}
              </div>
            ))}

            {result && (
              <Card className="border-dashed">
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Resultado preliminar</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Perfil:</span>
                    {(() => { const cls = classifyRisk(result.score); return (
                      <span className={cn('text-xs px-3 py-1 rounded-full border font-medium', cls.color)}>{cls.level}</span>
                    ); })()}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-4 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => { reset(); setResult(null); }}>
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