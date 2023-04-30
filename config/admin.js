module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "e4350524b0689fc3f46e2407dae950e2"),
  },
  apiToken: {
    salt: env("ADMIN_TOKEN_SALT", "aWK6KR4EmbWrwTO+HWhoaw=="),
  },
  watchIgnoreFiles: ['**/scripts/**', '**/logs/**'],
});
