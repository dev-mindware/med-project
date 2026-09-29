const REQUIRED_IN_ALL_ENVS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;
const REQUIRED_IN_PRODUCTION = ['FRONTEND_URL'] as const;

<<<<<<< Updated upstream
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
=======
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
>>>>>>> Stashed changes
  const missing: string[] = REQUIRED_IN_ALL_ENVS.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  const nodeEnv =
    typeof config.NODE_ENV === 'string' ? config.NODE_ENV : 'development';

  if (nodeEnv === 'production') {
    missing.push(
      ...REQUIRED_IN_PRODUCTION.filter((key) => {
        const value = config[key];
        return typeof value !== 'string' || value.trim().length === 0;
      }),
    );
  }

  if (missing.length > 0) {
    throw new Error(
      'Missing required environment variables: ' + missing.join(', '),
    );
  }

  const port = Number(config.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be an integer between 1 and 65535');

  const chunkWords = Number(config.VOCABULARY_CHUNK_WORDS ?? 2200);
  if (!Number.isInteger(chunkWords) || chunkWords < 100)
    throw new Error('VOCABULARY_CHUNK_WORDS must be an integer >= 100');

  const maxFileMb = Number(config.VOCABULARY_MAX_FILE_MB ?? 20);
  if (!Number.isInteger(maxFileMb) || maxFileMb < 1 || maxFileMb > 100)
    throw new Error(
      'VOCABULARY_MAX_FILE_MB must be an integer between 1 and 100',
    );

  const mediaMaxFileMb = Number(config.MEDIA_MAX_FILE_MB ?? 10);
  if (
    !Number.isInteger(mediaMaxFileMb) ||
    mediaMaxFileMb < 1 ||
    mediaMaxFileMb > 50
  )
    throw new Error('MEDIA_MAX_FILE_MB must be an integer between 1 and 50');

  return config;
}
