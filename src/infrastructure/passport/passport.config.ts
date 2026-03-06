import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
        callbackURL: '/api/v1/auth/google/callback',
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: unknown, user: Profile) => void,
      ) => {
        done(null, profile);
      },
    ),
  );
};
