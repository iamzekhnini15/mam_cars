import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VehiculeForm } from '@/components/vehicules/VehiculeForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VehiculeEditPageProps {
    params: Promise<{ id: string }>;
}

export default async function VehiculeEditPage({ params }: VehiculeEditPageProps) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;

    const vehicule = await prisma.vehicule.findUnique({
        where: { id },
    });

    if (!vehicule) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/vehicules/${id}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Modifier le véhicule</h1>
                    <p className="text-muted-foreground">
                        {vehicule.marque} {vehicule.modele} • {vehicule.version}
                    </p>
                </div>
            </div>

            <VehiculeForm vehicule={vehicule} isEdit={true} />
        </main>
    );
}
