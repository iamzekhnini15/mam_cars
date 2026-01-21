import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InterventionForm } from '@/components/interventions/InterventionForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewInterventionPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/interventions">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Nouvelle intervention</h1>
                    <p className="text-muted-foreground">
                        Enregistrer une nouvelle réparation ou entretien
                    </p>
                </div>
            </div>

            <InterventionForm />
        </main>
    );
}
