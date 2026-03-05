import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getRegisteredTeams } from './googleSheets';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                const teams = await getRegisteredTeams();
                const registered = teams.find(
                    (t) => t.email === (user.email ?? '').toLowerCase().trim(),
                );
                return !!registered;
            } catch {
                // If Sheets is unreachable (dev without creds), allow sign-in and handle in session
                return true;
            }
        },
        async jwt({ token, user }) {
            if (user?.email) {
                try {
                    const teams = await getRegisteredTeams();
                    const team = teams.find(
                        (t) => t.email === (user.email ?? '').toLowerCase().trim(),
                    );
                    if (team) {
                        token.teamName = team.teamName;
                        token.leaderName = team.leaderName;
                    }
                } catch {
                    token.teamName = user.name ?? 'Unknown Team';
                    token.leaderName = user.name ?? '';
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    // @ts-expect-error custom fields
                    teamName: token.teamName ?? '',
                    leaderName: token.leaderName ?? '',
                };
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
});
