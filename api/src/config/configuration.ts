export default () => ({
  app: {
    port: Number.parseInt(process.env.PORT ?? '4000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    mediaMaxFileMb: Number.parseInt(process.env.MEDIA_MAX_FILE_MB ?? '10', 10),
    frontendUrls: (
      process.env.FRONTEND_URL ??
      'http://localhost:3000,http://localhost:3001,http://localhost:3002'
    )
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
  },
  database: { url: process.env.DATABASE_URL },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  storage: {
    r2Endpoint: process.env.R2_ENDPOINT,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2PublicUrl: process.env.R2_PUBLIC_URL,
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.OPENAI_API_KEY,
    geminiModel:
      process.env.GEMINI_MODEL ??
      process.env.AI_MODEL ??
      process.env.OPENAI_MODEL ??
      'gemini-2.5-flash',
    openaiApiKey: process.env.OPENAI_API_KEY ?? process.env.GEMINI_API_KEY,
    openaiModel:
      process.env.GEMINI_MODEL ??
      process.env.AI_MODEL ??
      process.env.OPENAI_MODEL ??
      'gemini-2.5-flash',
    geminiOcrModel:
      process.env.GEMINI_OCR_MODEL ??
      process.env.GEMINI_MODEL ??
      process.env.AI_MODEL ??
      'gemini-2.5-flash',
    vocabularyChunkWords: Number.parseInt(
      process.env.VOCABULARY_CHUNK_WORDS ?? '2200',
      10,
    ),
    vocabularyMaxFileMb: Number.parseInt(
      process.env.VOCABULARY_MAX_FILE_MB ?? '100',
      10,
    ),
    mediaMaxFileMb: Number.parseInt(process.env.MEDIA_MAX_FILE_MB ?? '10', 10),
  },
});
