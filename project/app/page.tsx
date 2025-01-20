'use client';

import { Navbar } from '@/components/Navbar';
import { TableData } from '@/components/TableData';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
<main className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700" style={{border:'hidden'}} >
            <TableData />
          </table>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
