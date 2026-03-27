import { adminAuth } from './firebase/admin';
import { NextRequest } from 'next/server';

export async function verifyAuthToken(
  request: NextRequest
): Promise<{ uid: string; email?: string; name?: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
    };
  } catch {
    return null;
  }
}
