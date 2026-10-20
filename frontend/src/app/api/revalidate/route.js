import { revalidatePath } from 'next/cache';
import { API_URL } from '@/lib/api';

// Called by the admin dashboard after saving so new stories show up immediately.
export async function POST(request) {
  const auth = request.headers.get('authorization') || '';
  const res = await fetch(`${API_URL}/api/auth/me`, { headers: { authorization: auth }, cache: 'no-store' }).catch(() => null);
  const data = res?.ok ? await res.json() : null;
  if (data?.user?.role !== 'admin') return Response.json({ message: 'Not allowed' }, { status: 403 });
  revalidatePath('/', 'layout');
  return Response.json({ revalidated: true });
}
