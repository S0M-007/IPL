import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ? 'set' : 'MISSING';
  checks.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'MISSING';
  checks.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'MISSING';

  // Try Admin SDK init
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    checks.adminInit = 'ok';

    // Try a test write + read + delete
    const testRef = adminDb.ref('_health_check');
    await testRef.set({ ts: Date.now() });
    const snap = await testRef.get();
    checks.dbWrite = snap.exists() ? 'ok' : 'write failed';
    await testRef.remove();
    checks.dbCleanup = 'ok';
  } catch (err) {
    checks.adminInit = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'set');
  return NextResponse.json({ status: allOk ? 'healthy' : 'unhealthy', checks });
}
