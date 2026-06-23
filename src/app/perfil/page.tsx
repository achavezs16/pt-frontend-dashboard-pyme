'use client';

import Layout from '@/components/layout/Layout';

export default function PerfilPage() {
  const userInfo =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('userInfo') || '{}')
      : {};

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Perfil PYME
          </h1>

          <p className="text-gray-600 mt-1">
            Información general de la empresa y cuenta asociada.
          </p>
        </div>

        {/* Perfil principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                PY
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {userInfo.nombrePyme || 'TechStore Demo'}
                </h2>

                <p className="text-blue-100">
                  Plataforma logística PymeTrack
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Correo electrónico
              </p>

              <p className="text-gray-900 font-medium">
                {userInfo.email || 'pyme1@demo.cl'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Estado cuenta
              </p>

              <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Activa
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Plan operativo
              </p>

              <p className="text-gray-900 font-medium">
                PymeTrack Business
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Integración logística
              </p>

              <p className="text-gray-900 font-medium">
                RabbitMQ + Microservicios
              </p>
            </div>
          </div>
        </div>

        {/* Cards resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">📦</div>

            <h3 className="font-semibold text-gray-900">
              Gestión de pedidos
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Administración centralizada de pedidos, estados y logística.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🚚</div>

            <h3 className="font-semibold text-gray-900">
              Seguimiento operacional
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Integración en tiempo real con aplicación de repartidores.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🔔</div>

            <h3 className="font-semibold text-gray-900">
              Notificaciones
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Sistema preparado para eventos asíncronos y mensajería.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}