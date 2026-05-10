'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {

  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] =
    useState<any>(null);

  // =========================
  // Cargar dashboard desde BFF
  // =========================
  useEffect(() => {

    const cargarDatosDashboard = async () => {

      if (!isAuthenticated || !user) {
        return;
      }

      try {

        setLoading(true);

        const pymeId =
          user.pymeId || user.id;

        console.log(
          '🔄 Cargando dashboard desde BFF para PYME:',
          pymeId
        );

        // Obtener dashboard agregado desde BFF
        const response =
          await apiClient.getDashboard(pymeId);

        const data = response.data;

        console.log(
          '✅ Dashboard cargado:',
          data
        );

        setDashboardData(data);

      } catch (error) {

        console.error(
          '❌ Error cargando dashboard:',
          error
        );

        setDashboardData(null);

      } finally {

        setLoading(false);
      }
    };

    cargarDatosDashboard();

  }, [isAuthenticated, user]);

  // =========================
  // Loading
  // =========================
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">
            Cargando dashboard...
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // Error o sin datos
  // =========================
  if (!dashboardData) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error cargando dashboard
          </h2>

          <p className="text-gray-600">
            No fue posible obtener la información.
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // Datos dashboard
  // =========================
  const {
    pymeInfo,
    estadisticas,
    pedidosRecientes,
    productosActivos,
    alertas,
    ultimaActualizacion
  } = dashboardData;

  return (

    <div className="p-6 space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard PYME
        </h1>

        <p className="text-gray-600 mt-1">
          Bienvenido/a {pymeInfo?.nombrePyme}
        </p>

      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Pedidos Totales
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {estadisticas?.pedidosTotales || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Productos Activos
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {estadisticas?.productosActivos || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Pedidos Hoy
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {estadisticas?.pedidosHoy || 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Ingresos Totales
          </p>
          <h2 className="text-3xl font-bold mt-2">
            $
            {(estadisticas?.ingresosTotales || 0)
              .toLocaleString('es-CL')}
          </h2>
        </div>

      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl shadow-sm border p-6">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-semibold">
            Pedidos Recientes
          </h2>

        </div>

        <div className="space-y-4">

          {pedidosRecientes?.length > 0 ? (

            pedidosRecientes.map((pedido: any) => (

              <div
                key={pedido.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >

                <div>

                  <h3 className="font-semibold">
                    {pedido.numeroOrden}
                  </h3>

                  <p className="text-sm text-gray-600">
                    Cliente: {pedido.cliente}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    pedido.estado === 'DISPONIBLE'
                      ? 'bg-gray-100 text-gray-800'
                      : pedido.estado === 'ASIGNADO'
                      ? 'bg-yellow-100 text-yellow-800'
                      : pedido.estado === 'PEDIDO_RETIRADO'
                      ? 'bg-blue-100 text-blue-800'
                      : pedido.estado === 'EN_CAMINO'
                      ? 'bg-purple-100 text-purple-800'
                      : pedido.estado === 'ENTREGADO'
                      ? 'bg-green-100 text-green-800'
                      : pedido.estado === 'CANCELADO'
                      ? 'bg-red-100 text-red-800'
                      : pedido.estado === 'RECHAZADO'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>

                    {pedido.estado?.replaceAll('_', ' ')}

                  </span>

                  <span className="font-bold">
                    $
                    {pedido.total?.toLocaleString('es-CL')}
                  </span>

                </div>

              </div>

            ))

          ) : (

            <p className="text-gray-500">
              No hay pedidos recientes.
            </p>

          )}

        </div>

      </div>

      {/* Alertas */}
      <div className="bg-white rounded-xl shadow-sm border p-6">

        <h2 className="text-xl font-semibold mb-4">
          Alertas
        </h2>

        <div className="space-y-3">

          {alertas?.length > 0 ? (

            alertas.map((alerta: any, index: number) => (

              <div
                key={index}
                className="border rounded-lg p-4"
              >

                <p className="font-medium">
                  {alerta.tipo}
                </p>

                <p className="text-sm text-gray-600">
                  {alerta.mensaje}
                </p>

              </div>

            ))

          ) : (

            <p className="text-gray-500">
              No hay alertas activas.
            </p>

          )}

        </div>

      </div>

      {/* Footer */}
      <div className="text-sm text-gray-500">

        Última actualización:
        {' '}
        {ultimaActualizacion
          ? new Date(
              ultimaActualizacion
            ).toLocaleString('es-CL')
          : '-'}

      </div>

    </div>
  );
}
