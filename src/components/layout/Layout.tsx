// Layout principal del Portal PYME con TypeScript y Tailwind CSS

'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Pedidos', href: '/pedidos', icon: '📦' },
    { name: 'Crear Pedido', href: '/pedidos/crear', icon: '➕' },
    { name: 'Productos', href: '/productos', icon: '🛍️' },
    { name: 'Crear Producto', href: '/productos/crear', icon: '⭐' },
    { name: 'Perfil', href: '/perfil', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-2xl font-bold text-[#1E3A8A]">PymeTrack</div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#374151]">
                Portal PYME
              </span>
              <div className="h-8 w-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
                PY
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="mt-5 px-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#F3F4F6] text-[#1E3A8A] border-l-4 border-[#1E3A8A]'
                        : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-[#1E3A8A]'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
