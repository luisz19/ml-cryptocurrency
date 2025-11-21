import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/CryptoButton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type Cryptocurrency } from '@/api/coingecko';
import { cryptosApi, type EnrichedRecommendation, type CryptoRecommendationsResult } from '@/api/cryptos';

interface CryptoSelectorProps {
  selectedCrypto: (Cryptocurrency | EnrichedRecommendation) | null;
  onSelect: (crypto: Cryptocurrency | EnrichedRecommendation) => void;
  cryptos?: (Cryptocurrency | EnrichedRecommendation)[];
}

export function CryptoSelector({ selectedCrypto, onSelect, cryptos: providedCryptos }: CryptoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [cryptos, setCryptos] = useState<(Cryptocurrency | EnrichedRecommendation)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCryptocurrencies = async () => {
      if (providedCryptos && providedCryptos.length > 0) {
        setCryptos(providedCryptos);
        setLoading(false);
        if (!selectedCrypto) {
          onSelect(providedCryptos[0]);
        }
        return;
      }

      try {
        const data = await cryptosApi.getRecommendations();
        const list = Array.isArray(data) ? data : (data as CryptoRecommendationsResult).recommendations;
        setCryptos(list);

        if (!selectedCrypto && list.length > 0) {
          onSelect(list[0]);
        }
      } catch (error) {
        console.error('Falha ao carregar criptomoedas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCryptocurrencies();
  }, [providedCryptos, selectedCrypto, onSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-card hover:bg-accent transition-colors"
        >
          {selectedCrypto ? (
            <div className="flex items-center gap-2">
              <img
                src={selectedCrypto.image}
                alt={selectedCrypto.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="font-medium">{selectedCrypto.name}</span>
            </div>
          ) : loading ? (
            'Carregando'
          ) : (
            'Selecionar crypto'
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-popover border border-border shadow-lg">
        <Command>
          <CommandInput placeholder="Pesquisar" className="h-9" />
          <CommandEmpty>Nenhum dado encontrado.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px] overflow-y-auto">
              {cryptos.map((crypto) => (
                <CommandItem
                  key={crypto.id}
                  value={crypto.name}
                  onSelect={() => {
                    onSelect(crypto);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-accent"
                >
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {crypto.symbol}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${crypto.current_price?.toLocaleString()}
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          crypto.price_change_percentage_24h > 0
                            ? 'text-crypto-positive'
                            : 'text-crypto-negative'
                        )}
                      >
                        {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                        {crypto.price_change_percentage_24h?.toFixed(2)}%
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4',
                        selectedCrypto?.id === crypto.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}