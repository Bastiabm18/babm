// app/components/LogoBabm.tsx
'use client';
import Image from 'next/image';

interface LogoBabmProps {
  className?: string;
}

export default function LogoBabm({ className = "" }: LogoBabmProps) {
  return (
    <div className={`hidden md:block ${className}`}>
      <Image 
        src="/babm_new_bg.png" 
        alt="BABM Logo" 
        width={80}
        height={80}
        className="w-16 lg:w-24 xl:w-32 h-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => window.location.href = '/'}
      />
    </div>
  );
}