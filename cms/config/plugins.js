module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  upload: {
    config: {
      sizeLimit: 10 * 1024 * 1024,
      breakpoints: {
        large: 1200,
        medium: 750,
        small: 500,
      },
    },
  },
});
