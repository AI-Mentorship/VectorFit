// Simple env helper for TypeScript projects
export function getEnv(name: string, required = true): string {
  const v = process.env[name];
  if (required && (!v || v.trim() === '')) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v ?? '';
}

export default getEnv;
