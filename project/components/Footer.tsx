'use client';

import Image from 'next/image';
import { flexLogo, tpLogo } from '@/assets';

export function Footer() {
  return (
    <footer className="w-full bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-col justify-center items-center">
        <div className="flex justify-center items-center">
          <p className="text-white text-lg font-semibold">
            Grupo Tapajós
            <span className="text-white text-lg font-semibold" style={{ verticalAlign: 'super' }}>©</span>
          </p>
        </div>
        <div className="flex justify-center items-center">
        <p className="text-white text-sm font-semibold">
            By: gnoronha42
        </p>
        </div>
        
        <Image
          src={tpLogo}
          alt="Logo"
          width={200} // Ajuste o tamanho conforme necessário
          height={50} // Ajuste o tamanho conforme necessário
          className="object-contain"
        />
      </div>
    </footer>
  );
} 