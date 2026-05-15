'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const cargarDashboard = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);

        const pymeId = user.pymeId || user.id;
        const response = await apiClient.getDashboard(pymeId);

        setDashboardData(response.data);
      } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, [isAuthenticated, user]);

  const getEstadoBadge = (estado: string) => {
    const clases: Record<string, string> = {
      DISPONIBLE: 'bg-gray-100 text-gray-800',
      ASIGNADO: 'bg-yellow-100 text-yellow-800',
      PEDIDO_RETIRADO: 'bg-blue-100 text-blue-800',
      EN_CAMINO: 'bg-purple-100 text-purple-800',
      ENTREGADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
      RECHAZADO: 'bg-red-100 text-red-800',
    };

    return clases[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              No fue posible cargar el dashboard
            </h2>
            <p className="mt-2 text-gray-600">
              Revisa que el BFF esté levantado en el puerto 8084.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    pymeInfo,
    estadisticas,
    pedidosRecientes = [],
    alertas = [],
    ultimaActualizacion,
  } = dashboardData;

  const ultimosPedidos = pedidosRecientes.slice(0, 4);

  const pedidosActivos = pedidosRecientes.filter((pedido: any) =>
    ['DISPONIBLE', 'ASIGNADO', 'PEDIDO_RETIRADO', 'EN_CAMINO'].includes(
      pedido.estado
    )
  ).length;

  const pedidosEntregados = pedidosRecientes.filter(
    (pedido: any) => pedido.estado === 'ENTREGADO'
  ).length;

  const pedidosCancelados = pedidosRecientes.filter((pedido: any) =>
    ['CANCELADO', 'RECHAZADO'].includes(pedido.estado)
  ).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inicio
          </h1>
          <p className="mt-1 text-gray-600">
            Bienvenido/a, {pymeInfo?.nombrePyme || user?.nombre || 'PYME'}
          </p>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/pedidos/crear"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-2xl">📦</p>
            <h3 className="mt-3 font-semibold text-gray-900">
              Crear pedido
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Registra un nuevo despacho.
            </p>
          </Link>

          <Link
            href="/pedidos"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-2xl">📋</p>
            <h3 className="mt-3 font-semibold text-gray-900">
              Ver pedidos
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Revisa estados y seguimiento.
            </p>
          </Link>

          <Link
            href="/productos"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-2xl">🛒</p>
            <h3 className="mt-3 font-semibold text-gray-900">
              Catálogo
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona tus productos activos.
            </p>
          </Link>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos activos</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {pedidosActivos}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos totales</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {estadisticas?.pedidosTotales || 0}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos entregados</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {pedidosEntregados}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos cancelados</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {pedidosCancelados}
            </h2>
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Últimos pedidos
            </h2>

            <Link
              href="/pedidos"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </Link>
          </div>

          {ultimosPedidos.length > 0 ? (
            <div className="space-y-3">
              {ultimosPedidos.map((pedido: any) => (
                <div
                  key={pedido.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {pedido.numeroOrden}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliente: {pedido.cliente}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pedido.fecha
                        ? new Date(pedido.fecha).toLocaleString('es-CL')
                        : 'Sin fecha'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getEstadoBadge(
                        pedido.estado
                      )}`}
                    >
                      {pedido.estado?.replaceAll('_', ' ')}
                    </span>

                    <span className="font-bold text-gray-900">
                      ${Number(pedido.total || 0).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay pedidos recientes.</p>
          )}
        </div>

        {/* Alertas */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Alertas
          </h2>

          {alertas.length > 0 ? (
            <div className="space-y-3">
              {alertas.map((alerta: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-blue-100 bg-blue-50 p-4"
                >
                  <p className="font-medium text-blue-900">
                    {alerta.tipo}
                  </p>
                  <p className="text-sm text-blue-700">
                    {alerta.mensaje}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay alertas activas.</p>
          )}
        </div>

        {/* Footer actualización */}
        <p className="text-sm text-gray-500">
          Última actualización:{' '}
          {ultimaActualizacion
            ? new Date(ultimaActualizacion).toLocaleString('es-CL')
            : '-'}
        </p>
      </div>
    </Layout>
  );
}