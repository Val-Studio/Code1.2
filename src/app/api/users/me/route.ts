import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/me
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/me
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      avatar,
      timezone,
      bio,
      specializations,
      education,
      certificates,
      experience,
      price,
      languages,
    } = body;

    // Build update data
    const profileData: any = {
      firstName,
      lastName,
      phone,
      avatar,
      timezone,
    };

    // Add psychologist-specific fields if user is psychologist
    if (session.user.role === 'PSYCHOLOGIST') {
      Object.assign(profileData, {
        bio,
        specializations,
        education,
        certificates,
        experience,
        price: price ? Math.round(price * 100) : undefined, // Convert to kopecks
        languages,
      });
    }

    // Filter out undefined values
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profile: {
          update: profileData,
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
