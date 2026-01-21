import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vehiculeSchema } from '@/lib/validations/vehicule';

// GET - Récupérer un véhicule par ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        interventions: {
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        photos: {
          orderBy: { ordre: 'asc' },
        },
        historique: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicule);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du véhicule' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un véhicule
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validatedData = vehiculeSchema.partial().parse(body);

    // Vérifier si le véhicule existe
    const existingVehicule = await prisma.vehicule.findUnique({
      where: { id: params.id },
    });

    if (!existingVehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    // Si le VIN est modifié, vérifier qu'il n'existe pas déjà
    if (validatedData.vin && validatedData.vin !== existingVehicule.vin) {
      const vinExists = await prisma.vehicule.findUnique({
        where: { vin: validatedData.vin },
      });

      if (vinExists) {
        return NextResponse.json(
          { error: 'Un véhicule avec ce VIN existe déjà' },
          { status: 400 }
        );
      }
    }

    // Convertir dateAchat si nécessaire
    const dataToUpdate: any = { ...validatedData };
    if (dataToUpdate.dateAchat && typeof dataToUpdate.dateAchat === 'string') {
      dataToUpdate.dateAchat = new Date(dataToUpdate.dateAchat);
    }

    // Mettre à jour le véhicule
    const vehicule = await prisma.vehicule.update({
      where: { id: params.id },
      data: dataToUpdate,
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
        action: 'Modification',
        details: JSON.stringify({
          message: 'Informations du véhicule modifiées',
          modifications: Object.keys(validatedData),
        }),
      },
    });

    return NextResponse.json(vehicule);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du véhicule:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du véhicule' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un véhicule
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: params.id },
    });

    if (!vehicule) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le véhicule (cascade supprimera les interventions, photos, historique)
    await prisma.vehicule.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Véhicule supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du véhicule' },
      { status: 500 }
    );
  }
}
