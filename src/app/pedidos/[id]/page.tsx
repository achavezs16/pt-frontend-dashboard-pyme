'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type Pedido = {
  id: number;
  idPyme: number;
  numeroOrdenPyme: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  direccionEntregaChile: string;
  comunaEntregaChile: string;
  regionEntregaChile: string;
  estadoPedidoPyme: string;
  subtotal: number;
  costoDespachoChile: number;
  totalPedido: number;
  etiquetaDespachoPyme?: string;
  notasPedido?: string;
  creadoEn: string;
  actualizadoEn: string;
};

export default function DetallePedidoPage() {
  const params = useParams();
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  const pedidoId = params?.id;

  const obtenerPymeId = () => {
    try {
      const userInfoRaw = localStorage.getItem('userInfo');

      if (!userInfoRaw) return null;

      const userInfo = JSON.parse(userInfoRaw);

      return userInfo.pymeId ?? userInfo.idPyme ?? userInfo.pyme_id ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true);

        const pymeId = obtenerPymeId();

        if (!pymeId) {
          alert('No se pudo identificar la PYME. Vuelve a iniciar sesión.');
          router.push('/pedidos');
          return;
        }

        const response = await apiClient.get<Pedido[]>(`/pedidos/pyme/${pymeId}`);

        const pedidoEncontrado = response.data.find(
          (item) => Number(item.id) === Number(pedidoId)
        );

        if (!pedidoEncontrado) {
          alert('El pedido no pertenece a esta PYME o no existe.');
          router.push('/pedidos');
          return;
        }

        setPedido(pedidoEncontrado);
      } catch (error) {
        console.error('Error cargando pedido:', error);
        alert('No fue posible cargar el detalle del pedido.');
        router.push('/pedidos');
      } finally {
        setLoading(false);
      }
    };

    if (pedidoId) cargarPedido();
  }, [pedidoId, router]);

  const formatMoneda = (valor: number) => {
    return valor.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-blue-100 text-blue-800';
      case 'ACEPTADO':
      case 'ASIGNADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_CAMINO':
        return 'bg-purple-100 text-purple-800';
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalle del pedido
              </h2>
              <p className="text-sm text-gray-500">
                {pedido?.numeroOrdenPyme || 'Cargando...'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/pedidos')}
              className="text-2xl text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Cargando detalle del pedido...
            </div>
          ) : pedido ? (
            <>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="font-semibold text-gray-900">
                      {pedido.nombreCliente}
                    </p>
                    <p className="text-sm text-gray-600">{pedido.emailCliente}</p>
                    <p className="text-sm text-gray-600">
                      {pedido.telefonoCliente || 'Sin teléfono'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Estado actual</p>
                    <span
                      className={`inline-flex mt-2 px-3 py-1 text-xs font-medium rounded-full ${getEstadoColor(
                        pedido.estadoPedidoPyme
                      )}`}
                    >
                      {pedido.estadoPedidoPyme.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      Etiqueta: {pedido.etiquetaDespachoPyme || 'Sin etiqueta'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Dirección de entrega</p>
                  <p className="font-medium text-gray-900">
                    {pedido.direccionEntregaChile}
                  </p>
                  <p className="text-sm text-gray-600">
                    {pedido.comunaEntregaChile}, {pedido.regionEntregaChile}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-700">Subtotal</p>
                    <p className="font-bold text-blue-900">
                      {formatMoneda(pedido.subtotal)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-700">Despacho</p>
                    <p className="font-bold text-blue-900">
                      {formatMoneda(pedido.costoDespachoChile)}
                    </p>
                  </div>

                  <div className="bg-blue-100 rounded-lg p-4">
                    <p className="text-xs text-blue-700">Total</p>
                    <p className="font-bold text-blue-900">
                      {formatMoneda(pedido.totalPedido)}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-700 mb-1">
                    Notas / detalle del pedido
                  </p>
                  <p className="text-sm text-yellow-900 whitespace-pre-line">
                    {pedido.notasPedido || 'Sin notas registradas.'}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Creado: {new Date(pedido.creadoEn).toLocaleString('es-CL')}
                  <br />
                  Actualizado: {new Date(pedido.actualizadoEn).toLocaleString('es-CL')}
                </div>
              </div>

              <div className="border-t px-6 py-4 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/pedidos')}
                >
                  Cerrar
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}