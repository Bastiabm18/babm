import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";

const SESSION_COOKIE_NAME = "supabaseAuthSession";
const expiresIn = 60 * 60 * 24 * 5; // 5 días en segundos

// POST: Login normal o después de Callback de Google
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: { token?: string } = await request.json();
    const accessToken = body.token;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Token requerido" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Verificamos el token con Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 });
    }

    const uid = user.id;
    const email = user.email || '';
    const name = user.user_metadata?.full_name || email.split('@')[0] || 'Usuario';

    // 2. Buscar si el usuario ya existe en tu tabla "usuario"
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('usuario')
      .select('id, role')
      .eq('supabase_id', uid)
      .single();

    let userRole = 'user';

    if (selectError && selectError.code === 'PGRST116') {
      // 3. Si no existe (código PGRST116 = not found), lo creamos
      const { error: insertError } = await supabaseAdmin
        .from('usuario')
        .insert([{ 
          supabase_id: uid, 
          email: email, 
          name: name, 
          role: 'user' 
          // role, createdAt, updatedAt y estado toman el default de tu DB
        }])
        .select('id')
        .single();

      if (insertError) {
        console.error("Error al insertar usuario:", insertError.message);
      }
    } else if (existingUser) {
      // Si ya existe, tomamos su rol actual
      userRole = existingUser.role;
    } else if (selectError) {
      console.error("Error al buscar usuario:", selectError.message);
    }

    // 4. Crear la cookie
    const response = NextResponse.json(
      { success: true, message: "Sesión creada", role: userRole },
      { status: 200 }
    );

    response.headers.set("set-cookie", 
      `${SESSION_COOKIE_NAME}=${accessToken}; Path=/; HttpOnly; Max-Age=${expiresIn}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return response;

  } catch (error: any) {
    console.error("Error POST Session:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET: Leer la sesión para saber quién es el usuario actual
export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) return NextResponse.json({ user: null });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(sessionCookie.value);

    if (!user) return NextResponse.json({ user: null });

    // Opcional: Buscar datos extra en tu tabla (como el nombre de la DB o el rol)
    const { data: dbUser } = await supabaseAdmin
      .from('usuario')
      .select('name, role')
      .eq('supabase_id', user.id)
      .single();

    return NextResponse.json({ 
      user: { 
        uid: user.id, 
        email: user.email, 
        name: dbUser?.name || user.user_metadata?.full_name || 'Usuario', 
        role: dbUser?.role || 'user'
      } 
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

// DELETE: Cerrar sesión
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}