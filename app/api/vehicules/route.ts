import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vehiculeSchema } from '@/lib/validations/vehicule';
import { Carburant, Transmission, StatutVehicule } from '@prisma/client';

// GET - Récupérer tous les véhicules
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');
    const marque = searchParams.get('marque');
    const search = searchParams.get('search');

    // Construction de la requête avec filtres
    const where: any = {};

    if (statut) {
      where.statut = statut;
    }

    if (marque) {
      where.marque = { contains: marque, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { vin: { contains: search, mode: 'insensitive' } },
        { marque: { contains: search, mode: 'insensitive' } },
        { modele: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehicules = await prisma.vehicule.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        _count: {
          select: {
            interventions: true,
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(vehicules);
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des véhicules' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau véhicule
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validatedData = vehiculeSchema.parse(body);

    // Vérifier si le VIN existe déjà
    const existingVehicule = await prisma.vehicule.findUnique({
      where: { vin: validatedData.vin },
    });

    if (existingVehicule) {
      return NextResponse.json(
        { error: 'Un véhicule avec ce VIN existe déjà' },
        { status: 400 }
      );
    }

    // Convertir dateAchat en Date si c'est une string
    const dateAchat = typeof validatedData.dateAchat === 'string'
      ? new Date(validatedData.dateAchat)
      : validatedData.dateAchat;

    // Créer le véhicule
    const vehicule = await prisma.vehicule.create({
      data: {
        ...validatedData,
        dateAchat,
        carburant: validatedData.carburant as Carburant,
        transmission: validatedData.transmission as Transmission,
        statut: validatedData.statut as StatutVehicule | undefined,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    // Créer une entrée dans l'historique
    await prisma.historique.create({
      data: {
        vehiculeId: vehicule.id,
        userId: session.user.id,
        action: 'Création',
        details: JSON.stringify({
          message: 'Véhicule ajouté au stock',
          vehicule: {
            marque: vehicule.marque,
            modele: vehicule.modele,
            vin: vehicule.vin,
          },
        }),
      },
    });

    return NextResponse.json(vehicule, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du véhicule:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du véhicule' },
      { status: 500 }
    );
  }
}
