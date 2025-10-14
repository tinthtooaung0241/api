export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  },
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  upload: {
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'my-bucket',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'my-access-key',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'my-secret-key',
  },
});
