import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ---> ESTA FUNCIÓN ES LA QUE TE FALTABA Y TIENE TU EJEMPLO FUNCIONAL <---
function getCookieFromHeaders(request: NextRequest, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : undefined;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // ---> SACAMOS EL LANG QUE ACABAMOS DE PASAR DESDE LOGIN <---
  const lang = requestUrl.searchParams.get('lang') || 'es';

  if (!code) {
    return NextResponse.redirect(new URL(`/${lang}/login?error=auth_failed`, request.url));
  }

  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => getCookieFromHeaders(request, name),
        set: () => {},
        remove: () => {},
      },
    }
  );

  try {
    const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);
    if (error || !data.session) throw error;

    const accessToken = data.session.access_token;

    const sessionResponse = await fetch(`${requestUrl.origin}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    });

    if (!sessionResponse.ok) {
      throw new Error("Error sincronizando DB");
    }

    const setCookieHeader = sessionResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error("No se recibió la cookie");
    }

    // ---> REDIRECCIONAMOS CON EL LANG CORRECTO <---
    const redirectResponse = NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
    redirectResponse.headers.set('set-cookie', setCookieHeader);

    return redirectResponse;

  } catch (e) {
    console.error('Error en callback:', e);
    return NextResponse.redirect(new URL(`/${lang}/login?error=internal`, request.url));
  }
}