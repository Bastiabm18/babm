// lib/firebase/firebase-admin.ts

import { getApps, initializeApp, cert } from 'firebase-admin/app'; // FIX: Se importa 'cert' en lugar de 'credential'
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let instances: { auth: Auth; firestore: Firestore } | null = null;

export function getAdminInstances() {
  if (instances) {
    return instances;
  }

  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount), // FIX: Se usa la función 'cert' directamente
      });
    } else {
      initializeApp();
    }
  }

  instances = {
    auth: getAuth(),
    firestore: getFirestore()
  };

  return instances;
}