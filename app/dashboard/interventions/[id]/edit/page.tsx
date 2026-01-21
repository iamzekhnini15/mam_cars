import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { InterventionForm } from '@/components/interventions/InterventionForm';

interface EditInterventionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInterventionPage({ params }: EditInterventionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const intervention = await prisma.intervention.findUnique({
    where: { id },
    include: {
      vehicule: {
        select: {
          id: true,
          marque: true,
          modele: true,
          version: true,
        },
      },
    },
  });

  if (!intervention) {
    notFound();
  }

  // Convertir Decimal en number pour le composant client
  const interventionData = {
    ...intervention,
    cout: intervention.cout ? Number(intervention.cout) : null,
    datePrevue: intervention.datePrevue ? intervention.datePrevue.toISOString() : null,
    dateDebut: intervention.dateDebut ? intervention.dateDebut.toISOString() : null,
    dateRealisation: intervention.dateRealisation ? intervention.dateRealisation.toISOString() : null,
  };

  return (
    <>
      {/* En-tête */}
      <div className="mb-6">
        <Link href={`/dashboard/interventions/${id}`}>
          <button className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'intervention
          </button>
        </Link>
        <h1 className="text-3xl font-bold">Modifier l'intervention</h1>
        <p className="text-muted-foreground">
          {intervention.vehicule.marque} {intervention.vehicule.modele} {intervention.vehicule.version}
        </p>
      </div>

      {/* Formulaire */}
      <InterventionForm 
        intervention={interventionData} 
        vehiculeId={intervention.vehiculeId}
      />
    </>
  );
}
