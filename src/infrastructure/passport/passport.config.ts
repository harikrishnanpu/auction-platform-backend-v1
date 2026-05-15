import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export const configureGoogleStrategy = () => {
    const verify: ConstructorParameters<typeof GoogleStrategy>[1] = (
        _req,
        _accessToken,
        _refreshToken,
        _params,
        profile,
        done,
    ) => {
        done(null, profile as never);
    };

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_AUTH_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
                callbackURL: '/api/v1/auth/google/callback',
                passReqToCallback: true,
            },
            verify,
        ),
    );
};
