import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      nom: string;
      prenom: string;
      role: Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    nom: string;
    prenom: string;
  }
}
