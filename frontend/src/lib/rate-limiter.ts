/**
 * Utilitários para controle de rate limiting e retry
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Se não for erro de rate limit ou última tentativa, lança erro
      if (error?.status !== 429 || attempt === maxRetries) {
        throw error;
      }
      
      // Calcula delay com backoff exponencial
      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);
      
      console.warn(`Rate limit atingido. Tentativa ${attempt + 1}/${maxRetries}. Aguardando ${delay}ms...`);
      
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate limiter simples usando fila
 */
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval: number;
  
  constructor(minInterval: number = 1500) {
    this.minInterval = minInterval; // mínimo 1.5s entre requisições
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Aguarda se necessário
      if (timeSinceLastRequest < this.minInterval) {
        await sleep(this.minInterval - timeSinceLastRequest);
      }
      
      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }
    
    this.processing = false;
  }
}

export const coinGeckoLimiter = new RateLimiter(1500); // 1.5s entre chamadas

/**
 * Limita requisições paralelas
 */
export async function limitConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number = 3
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      // Remove promises resolvidas
      executing.splice(0, executing.findIndex(p => p === promise) + 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}
