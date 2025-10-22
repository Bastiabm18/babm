// app/[lang]/api/auth/session/route.ts

import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getAdminInstances } from "@/lib/firebase/firebase-admin";
import { DocumentSnapshot } from 'firebase-admin/firestore';

const SESSION_COOKIE_NAME = "firebaseAuthSession";
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { auth: adminAuth, firestore: adminFirestore } = getAdminInstances();
        
    const body: { token?: string } = await request.json();
    const idToken = body.token;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { success: false, message: "ID token is required." },
        { status: 400 }
      );
    }

    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    if (decodedIdToken) {
      const uid = decodedIdToken.uid;
      const userDocRef = adminFirestore.doc(`users/${uid}`);
      const userDocSnap: DocumentSnapshot = await userDocRef.get();

      const userData = userDocSnap.data();
      const userRole = userData?.role || 'user';

      await adminAuth.setCustomUserClaims(uid, { role: userRole });
      
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

      // Esta línea funciona para localhost porque 'secure' será 'false' en desarrollo.
      cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Correcto para localhost y producción
        path: "/",
        sameSite: "lax",
      });

      // **Log para confirmar que la cookie se creó**
      console.log('✅ [API/SESSION] Cookie creada exitosamente para el usuario:', decodedIdToken.email);

      return NextResponse.json(
        { success: true, message: "Session created successfully." }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid ID token." },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal server error",
        code: error.code 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    
    // **Log para confirmar que la cookie se borró**
    console.log('✅ [API/SESSION] Cookie borrada exitosamente.');

    return NextResponse.json({ success: true, message: "Session deleted." });
  } catch (error: any) {
    console.error("❌ Error deleting session:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete session." },
      { status: 500 }
    );
  }
}