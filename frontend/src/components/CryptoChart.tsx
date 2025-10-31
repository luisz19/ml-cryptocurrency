import { useState, useEffect } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

import { Button } from '@/components/ui/CryptoButton';
import { Card, CardContent } from '@/components/ui/CryptoCerd';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchCryptoPriceHistory, type Cryptocurrency, type PriceData } from '@/api/coingecko';

interface CryptoChartProps {
    selectedCrypto: Cryptocurrency | null;
    className?: string;
}

type TimePeriod = 7 | 15 | 30;

interface ChartDataPoint {
    date: string;
    price: number;
    timestamp: number;
}

export function CryptoChart({ selectedCrypto, className }: CryptoChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(7);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const periods: { value: TimePeriod; label: string }[] = [
        { value: 7, label: '7D' },
        { value: 15, label: '15D' },
        { value: 30, label: '30D' },
    ];

    useEffect(() => {
        if (!selectedCrypto) return;

        const loadChartData = async () => {
            setLoading(true);
            setError(null);

            try {
                const priceHistory = await fetchCryptoPriceHistory(
                    selectedCrypto.id,
                    selectedPeriod
                );

                const formattedData: ChartDataPoint[] = priceHistory.map(
                    (point: PriceData) => ({
                        date: new Date(point.timestamp).toLocaleDateString('pt-BR', {
                            month: 'short',
                            day: 'numeric',
                        }),
                        price: point.price,
                        timestamp: point.timestamp,
                    })
                );

                setChartData(formattedData);
            } catch (err) {
                setError('Falha ao carregar dados do gráfico');
                console.error('Chart data error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadChartData();
    }, [selectedCrypto, selectedPeriod]);

    const formatPrice = (value: number) => {
        if (value >= 1) {
            return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
        return `$${value.toFixed(6)}`;
    };

    if (error) {
        return (
            <Card className={cn('w-full', className)}>
                <CardContent className="p-6">
                    <div className="text-center text-destructive">{error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('w-full', className)}>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        {selectedCrypto && (
                            <>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedCrypto.image}
                                        alt={selectedCrypto.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <h2 className="text-2xl font-bold">{selectedCrypto.name}</h2>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="text-3xl font-bold">
                                            {formatPrice(selectedCrypto.current_price)}
                                        </div>
                                        <div
                                            className={cn(
                                                'text-sm font-medium',
                                                selectedCrypto.price_change_percentage_24h > 0
                                                    ? 'text-[#99E39E]'
                                                    : 'text-red-500'
                                            )}
                                        >
                                            {selectedCrypto.price_change_percentage_24h > 0 ? '+' : ''}
                                            {selectedCrypto.price_change_percentage_24h?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-5 p-1 rounded-lg">
                        {periods.map((period) => (
                            <Button
                                key={period.value}
                                variant={selectedPeriod === period.value ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedPeriod(period.value)}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium transition-all cursor-pointer',
                                    selectedPeriod === period.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'hover:bg-background'
                                )}
                            >
                                {period.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="w-full">
                    {loading ? (
                        chartData.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-gray-800 dark:text-white">
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Carregando...</span>
                            </div>
                        ) : (

                            <div className="h-[400px] flex flex-col gap-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="flex-1 w-full" />
                            </div>
                        )
                    ) : chartData.length > 0 ? (
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#99E39E"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#99E39E"
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9E9E9E"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={false}
                                    />
                                    <YAxis
                                        domain={['dataMin', 'dataMax']}
                                        stroke="#9E9E9E"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatPrice}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover border border-border rounded p-3 shadow-lg">
                                                        <p
                                                            className="text-sm font-medium"
                                                            style={{ color: '#9E9E9E' }}
                                                        >
                                                            {label}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium text-primary">
                                                                {formatPrice(payload[0].value as number)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#99E39E"
                                        strokeWidth={2}
                                        fill="url(#colorPrice)"
                                        dot={false}
                                        activeDot={{
                                            r: 4,
                                            stroke: '#99E39E',
                                            strokeWidth: 2,
                                            fill: 'hsl(var(--background))',
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-gray-800 dark:text-white gap-2 mb-15  ">
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Carregando...</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}