import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Email ou mot de passe manquant');
          throw new Error('Email et mot de passe requis');
        }

        try {
          // Chercher l'utilisateur
          console.log('[AUTH] Recherche utilisateur:', credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error('[AUTH] Utilisateur non trouvé:', credentials.email);
            throw new Error('Identifiants invalides');
          }

          console.log('[AUTH] Utilisateur trouvé:', user.email);

          // Vérifier si l'utilisateur est actif
          if (!user.actif) {
            console.error('[AUTH] Compte désactivé:', user.email);
            throw new Error('Compte désactivé');
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.error('[AUTH] Mot de passe invalide pour:', user.email);
            throw new Error('Identifiants invalides');
          }

          console.log('[AUTH] Authentification réussie pour:', user.email);

          // Retourner l'utilisateur (sans le mot de passe)
          return {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
          };
        } catch (error) {
          console.error('[AUTH] Erreur lors de l\'authentification:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nom = user.nom;
        token.prenom = user.prenom;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.nom = token.nom as string;
        session.user.prenom = token.prenom as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
