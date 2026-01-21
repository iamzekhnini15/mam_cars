import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Sinon, rediriger vers la page de login
  redirect('/login');
}

