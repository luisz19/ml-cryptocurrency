import { useEffect, useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { fetchTopCryptocurrenciesWithSparkline, type Cryptocurrency } from '@/api/coingecko';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface MarketTableProps {
  onSelect?: (c: Cryptocurrency) => void;
  selectedId?: string | null;
  currency?: string;
  limit?: number;
  data?: Cryptocurrency[];
}

export function MarketTable({ onSelect, selectedId, currency = 'usd', limit = 15, data: externalData }: MarketTableProps) {
  const [data, setData] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetchTopCryptocurrenciesWithSparkline(limit, currency);
        setData(res);
      } catch (e:any) {
        setError(e.message || 'Erro ao carregar ativos');
      } finally { setLoading(false); }
    };
    load();
  }, [limit, currency, externalData]);

  const riskLevels = ['Alto', 'Médio', 'Baixo'] as const;
  type Risk = typeof riskLevels[number] | '—';

  const rows = useMemo(() => data.map(c => {
    const riskRaw = String(((c as any).risk_level ?? (c as any).Risk_Level ?? '')).toLowerCase();
    let risk: Risk = '—';
    if (riskRaw === 'alto' || riskRaw === 'high') risk = 'Alto';
    else if (riskRaw.startsWith('mod') || riskRaw === 'moderate' || riskRaw === 'medium') risk = 'Médio';
    else if (riskRaw === 'baixo' || riskRaw === 'low') risk = 'Baixo';
    const raw = c.sparkline_in_7d?.price || [];
    const tail = raw.slice(-60); 
    const min = Math.min(...tail);
    const max = Math.max(...tail);
    const range = max - min || 1;
    const normalized = tail.map((p, i) => ({ i, p: ((p - min) / range) * 100 }));
    return ({
      ...c,
      risk,
      eligible_for_profile: (c as any).eligible_for_profile,
      changePositive: c.price_change_percentage_24h >= 0,
      spark: normalized,
    });
  }), [data]);

  if (error) return <div className="text-destructive text-sm p-4">{error}</div>;

  return (
    <div className="relative rounded-md border border-border/40 overflow-hidden">
      {loading && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center text-xs">Carregando...</div>}
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
             <TableHead className="w-12 px-3">#</TableHead>
            <TableHead className="px-3">Ativo</TableHead>
            <TableHead className="w-1/6 px-4 text-right">Preço</TableHead>
            <TableHead className="w-1/6 px-4 text-right">24h %</TableHead>
            <TableHead className="w-1/6 px-4 text-right">Risco</TableHead>
            <TableHead className="w-1/6 px-4 text-right">Elegível</TableHead>
            <TableHead className="w-1/6 px-4 text-right">Sparkline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(c => (
            <TableRow key={c.id} onClick={() => onSelect?.(c)} className={cn('cursor-pointer text-xs md:text-sm', selectedId === c.id && 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary')}>
              <TableCell className="font-medium px-3">{c.market_cap_rank}</TableCell>
              <TableCell className="px-3">
                <div className="flex items-center gap-2 truncate">
                  <img src={c.image} className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0" alt={c.name} />
                  <span className="font-semibold truncate max-w-[5rem] md:max-w-[7rem]">{c.name}</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground uppercase flex-shrink-0">{c.symbol}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium px-3">{currency === 'usd' ? '$' : '€'}{c.current_price.toLocaleString()}</TableCell>
              <TableCell className={cn('text-right px-3 font-semibold', c.changePositive ? 'text-[#99E39E]' : 'text-red-500')}>{c.price_change_percentage_24h?.toFixed(2)}%</TableCell>
              <TableCell className="text-right px-3">
                <span className={cn('text-[10px] md:text-xs font-medium px-2 py-1 rounded-full border',
                  c.risk === 'Alto' && 'text-red-500 border-red-500/40 bg-red-500/10',
                  c.risk === 'Médio' && 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
                  c.risk === 'Baixo' && 'text-[#99E39E] border-[#99E39E]/40 bg-[#99E39E]/10'
                )}>{c.risk}</span>
              </TableCell>
              <TableCell className="text-right px-3">
                {c.eligible_for_profile === undefined ? (
                  <span className="text-[10px] md:text-xs text-muted-foreground">—</span>
                ) : c.eligible_for_profile ? (
                  <Check className="h-4 w-4 text-[#99E39E] mx-auto" />
                ) : (
                  <X className="h-4 w-4 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="px-2 md:px-3">
                <div className="h-8 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={c.spark} margin={{ top:0, right:0, left:0, bottom:0}}>
                      <Area type="monotone" dataKey="p" stroke={c.changePositive ? '#99E39E' : '#ef4444'} strokeWidth={1.1} fillOpacity={0.18} fill={c.changePositive ? '#99E39E' : '#ef4444'} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
