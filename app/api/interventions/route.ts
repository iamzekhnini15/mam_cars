import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { interventionSchema } from '@/lib/validations/intervention';
import { TypeIntervention, StatutIntervention } from '@prisma/client';
import { z } from 'zod';

// GET - Récupérer toutes les interventions avec filtres
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehiculeId = searchParams.get('vehiculeId');
    const statut = searchParams.get('statut');
    const type = searchParams.get('type');

    const where: any = {};

    if (vehiculeId) {
      where.vehiculeId = vehiculeId;
    }

    if (statut) {
      where.statut = statut;
    }

    if (type) {
      where.type = type;
    }

    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        vehicule: {
          select: {
            id: true,
            marque: true,
            modele: true,
            version: true,
            vin: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(interventions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des interventions' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle intervention
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validatedData = interventionSchema.parse(body);

    // Vérifier que le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: validatedData.vehiculeId },
    });

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    // Convertir les dates si nécessaire
    const dataToCreate: any = { ...validatedData };
    if (dataToCreate.datePrevue && typeof dataToCreate.datePrevue === 'string') {
      dataToCreate.datePrevue = new Date(dataToCreate.datePrevue);
    }
    if (dataToCreate.dateDebut && typeof dataToCreate.dateDebut === 'string') {
      dataToCreate.dateDebut = new Date(dataToCreate.dateDebut);
    }
    if (dataToCreate.dateRealisation && typeof dataToCreate.dateRealisation === 'string') {
      dataToCreate.dateRealisation = new Date(dataToCreate.dateRealisation);
    }
    
    // Cast des enums vers les types Prisma
    dataToCreate.type = dataToCreate.type as TypeIntervention;
    if (dataToCreate.statut) {
      dataToCreate.statut = dataToCreate.statut as StatutIntervention;
    }

    // Créer l'intervention
    const intervention = await prisma.intervention.create({
      data: {
        ...dataToCreate,
        createdBy: session.user.id,
      },
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

    // Mettre à jour le coût de réparations du véhicule si l'intervention a un coût
    if (validatedData.cout && validatedData.cout > 0) {
      const currentCout = Number(vehicule.coutReparations || 0);
      await prisma.vehicule.update({
        where: { id: validatedData.vehiculeId },
        data: {
          coutReparations: currentCout + validatedData.cout,
        },
      });
    }

    return NextResponse.json(intervention, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'intervention:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'intervention' },
      { status: 500 }
    );
  }
}
