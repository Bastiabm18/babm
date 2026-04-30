/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
    {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Para fotos de perfil de Google
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Para imágenes de Firebase Storage
         pathname: '/babm-web.firebasestorage.app/**', // <-- Este es el path a tu bucket
     
      },{
        protocol: 'https',
        hostname:'kohqdmwhqxjwgzsriieu.supabase.co',
        

      }

    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; // <- Este es el cambio