import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { interventionSchema } from '@/lib/validations/intervention';
import { TypeIntervention, StatutIntervention } from '@prisma/client';
import { z } from 'zod';

// GET - Récupérer une intervention par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
            vin: true,
            statut: true,
          },
        },
        creator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(intervention);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'intervention:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'intervention' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une intervention
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validation des données
    const validatedData = interventionSchema.partial().parse(body);

    // Vérifier si l'intervention existe
    const existingIntervention = await prisma.intervention.findUnique({
      where: { id },
      include: {
        vehicule: true,
      },
    });

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      );
    }

    // Convertir les dates si nécessaire
    const dataToUpdate: any = { ...validatedData };
    if (dataToUpdate.datePrevue && typeof dataToUpdate.datePrevue === 'string') {
      dataToUpdate.datePrevue = new Date(dataToUpdate.datePrevue);
    }
    if (dataToUpdate.dateDebut && typeof dataToUpdate.dateDebut === 'string') {
      dataToUpdate.dateDebut = new Date(dataToUpdate.dateDebut);
    }
    if (dataToUpdate.dateRealisation && typeof dataToUpdate.dateRealisation === 'string') {
      dataToUpdate.dateRealisation = new Date(dataToUpdate.dateRealisation);
    }
    
    // Cast des enums vers les types Prisma
    if (dataToUpdate.type) {
      dataToUpdate.type = dataToUpdate.type as TypeIntervention;
    }
    if (dataToUpdate.statut) {
      dataToUpdate.statut = dataToUpdate.statut as StatutIntervention;
    }

    // Gérer la mise à jour du coût de réparations du véhicule
    if (validatedData.cout !== undefined) {
      const oldCout = Number(existingIntervention.cout);
      const newCout = Number(validatedData.cout);
      const difference = newCout - oldCout;

      if (difference !== 0) {
        const currentVehiculeCout = Number(existingIntervention.vehicule.coutReparations || 0);
        await prisma.vehicule.update({
          where: { id: existingIntervention.vehiculeId },
          data: {
            coutReparations: currentVehiculeCout + difference,
          },
        });
      }
    }

    // Mettre à jour l'intervention
    const intervention = await prisma.intervention.update({
      where: { id },
      data: dataToUpdate,
      include: {
        vehicule: {
          select: {
            id: true,
            marque: true,
            modele: true,
            version: true,
          },
        },
        creator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json(intervention);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de l\'intervention:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'intervention' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une intervention
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier si l'intervention existe
    const intervention = await prisma.intervention.findUnique({
      where: { id },
      include: {
        vehicule: true,
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      );
    }

    // Soustraire le coût de l'intervention du coût total de réparations du véhicule
    if (intervention.cout && Number(intervention.cout) > 0) {
      const currentCout = Number(intervention.vehicule.coutReparations || 0);
      await prisma.vehicule.update({
        where: { id: intervention.vehiculeId },
        data: {
          coutReparations: Math.max(0, currentCout - Number(intervention.cout)),
        },
      });
    }

    // Supprimer l'intervention
    await prisma.intervention.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Intervention supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'intervention:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'intervention' },
      { status: 500 }
    );
  }
}
