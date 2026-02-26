function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  maxai: {
    apiKey: () => required("MAXAI_API_KEY"),
    apiUrl: () => optional("MAXAI_API_URL", "https://dashboard.maxcare.ai").replace(/\/$/, ""),
  },
  database: {
    url: () => required("DATABASE_URL"),
  },
  app: {
    url: () => optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  },
} as const;
