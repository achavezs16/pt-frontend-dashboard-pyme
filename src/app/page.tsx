'use client';

// Dashboard TechStore SPA con TypeScript y Next.js

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { EstadoPedidoPyme } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard usando BFF
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Cargando dashboard desde BFF para PYME:', user.id);
        
        // Usar el BFF para obtener datos agregados del dashboard
        const response = await apiClient.getDashboard(user.pymeId || user.id);
        const data = response.data;
        
        console.log('✅ Dashboard cargado desde BFF:', data);
        setDashboardData(data);
        
      } catch (error) {
        console.error('❌ Error cargando datos del dashboard desde BFF:', error);
        
        // Fallback a datos vacíos si hay error
        setDashboardData({
          pymeInfo: user,
          estadisticas: {
            pedidosTotales: 0,
            pedidosHoy: 0,
            productosActivos: 0,
            stockBajo: 0,
            ingresosTotales: 0,
            ingresosHoy: 0
          },
          pedidosRecientes: [],
          productosActivos: [],
          alertas: []
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Extraer datos del dashboard del BFF
  const stats = dashboardData?.estadisticas ? [
    { 
      label: 'Pedidos Totales', 
      value: dashboardData.estadisticas.pedidosTotales?.toString() || '0', 
      change: dashboardData.estadisticas.pedidosHoy > 0 ? `+${dashboardData.estadisticas.pedidosHoy}` : '0', 
      changeType: dashboardData.estadisticas.pedidosHoy > 0 ? 'positive' : 'neutral' 
    },
    { 
      label: 'Pedidos Hoy', 
      value: dashboardData.estadisticas.pedidosHoy?.toString() || '0', 
      change: dashboardData.estadisticas.pedidosHoy > 0 ? `+${dashboardData.estadisticas.pedidosHoy}` : '0', 
      changeType: dashboardData.estadisticas.pedidosHoy > 0 ? 'positive' : 'neutral' 
    },
    { 
      label: 'Productos Activos', 
      value: dashboardData.estadisticas.productosActivos?.toString() || '0', 
      change: dashboardData.estadisticas.productosActivos > 0 ? `+${dashboardData.estadisticas.productosActivos}` : '0', 
      changeType: dashboardData.estadisticas.productosActivos > 0 ? 'positive' : 'neutral' 
    },
    { 
      label: 'Stock Bajo', 
      value: dashboardData.estadisticas.stockBajo?.toString() || '0', 
      change: dashboardData.estadisticas.stockBajo > 0 ? `+${dashboardData.estadisticas.stockBajo}` : '0', 
      changeType: dashboardData.estadisticas.stockBajo > 0 ? 'negative' : 'neutral' 
    }
  ] : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header del Dashboard TechStore */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard TechStore</h1>
            <p className="text-gray-600">Bienvenido al portal de administración</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.nombrePyme}</p>
              <p className="text-xs text-gray-500">{user.emailContacto}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Pedidos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pedidos Recientes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
              <Link href="/pedidos">
                <Button variant="secondary" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.pedidosRecientes?.map((pedido: any) => (
                <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{pedido.numeroOrden}</p>
                    <p className="text-sm text-gray-600">{pedido.cliente}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.estado === 'CONFIRMADO' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pedido.estado}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{pedido.fecha}</p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.pedidosRecientes || dashboardData.pedidosRecientes.length === 0) && (
                <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/pedidos/crear">
                <div className="bg-[#F3F4F6] p-4 rounded-lg border border-gray-200 hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                    <h3 className="font-semibold text-[#374151] group-hover:text-[#1E3A8A] transition-colors">Crear Pedido</h3>
                    <p className="text-xs text-gray-500 mt-1">Nuevo pedido</p>
                  </div>
                </div>
              </Link>
              <Link href="/productos">
                <div className="bg-[#F3F4F6] p-4 rounded-lg border border-gray-200 hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛍️</div>
                    <h3 className="font-semibold text-[#374151] group-hover:text-[#1E3A8A] transition-colors">Productos</h3>
                    <p className="text-xs text-gray-500 mt-1">Gestionar catálogo</p>
                  </div>
                </div>
              </Link>
              <Link href="/pedidos">
                <div className="bg-[#F3F4F6] p-4 rounded-lg border border-gray-200 hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                    <h3 className="font-semibold text-[#374151] group-hover:text-[#1E3A8A] transition-colors">Pedidos</h3>
                    <p className="text-xs text-gray-500 mt-1">Ver todos</p>
                  </div>
                </div>
              </Link>
              <Link href="/perfil">
                <div className="bg-[#F3F4F6] p-4 rounded-lg border border-gray-200 hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
                    <h3 className="font-semibold text-[#374151] group-hover:text-[#1E3A8A] transition-colors">Perfil</h3>
                    <p className="text-xs text-gray-500 mt-1">Configuración</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {dashboardData?.alertas && dashboardData.alertas.length > 0 && (
          <div className="space-y-3">
            {dashboardData.alertas.map((alerta: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alerta.nivel === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                alerta.nivel === 'ERROR' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {alerta.nivel === 'WARNING' ? '⚠️' : alerta.nivel === 'ERROR' ? '❌' : 'ℹ️'}
                  </span>
                  <div>
                    <h3 className={`font-medium ${
                      alerta.nivel === 'WARNING' ? 'text-yellow-800' :
                      alerta.nivel === 'ERROR' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {alerta.tipo}
                    </h3>
                    <p className={`text-sm ${
                      alerta.nivel === 'WARNING' ? 'text-yellow-700' :
                      alerta.nivel === 'ERROR' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {alerta.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información de Bienvenida TechStore */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900">¡Bienvenido a {user.nombrePyme}!</h3>
              <p className="text-blue-700 mt-1">
                Portal de administración para tu tienda tecnológica. Gestiona tu catálogo de {dashboardData?.estadisticas?.productosActivos || 0} productos, 
                controla el inventario en tiempo real y procesa pedidos de manera eficiente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📦 {dashboardData?.estadisticas?.productosActivos || 0} Productos
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  📋 {dashboardData?.estadisticas?.pedidosTotales || 0} Pedidos
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  � ${dashboardData?.estadisticas?.ingresosHoy || 0} Hoy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
