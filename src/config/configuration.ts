export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    type: process.env.DATABASE_TYPE,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  jwt_key: process.env.JWT_TOKEN,
  host: process.env.HOST,
  email_username: process.env.EMAIL_USERNAME,
  email_password: process.env.EMAIL_PASSWORD,
});
