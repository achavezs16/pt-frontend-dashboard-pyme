// Página de gestión de pedidos del Portal PYME

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Pedido, EstadoPedido } from '@/types';
import apiClient from '@/lib/api';
import Link from 'next/link';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    cliente: '',
    page: 0,
    size: 10
  });

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      console.log('🔄 Iniciando carga de pedidos...');
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.cliente) params.append('cliente', filtros.cliente);
      params.append('page', filtros.page.toString());
      params.append('size', filtros.size.toString());

      const pymeInfo = localStorage.getItem('pymeInfo');
      const parsedPymeInfo = pymeInfo ? JSON.parse(pymeInfo) : null;

      const pymeId =
        parsedPymeInfo?.pymeId ||
        parsedPymeInfo?.id ||
        parsedPymeInfo?.userInfo?.pymeId ||
        1;

      console.log(`📡 Haciendo petición a pedidos de PYME ${pymeId}`);

      const response = await apiClient.getPedidosByPyme(pymeId);
      
      const pedidosData = response.data as Pedido[] || [];
      console.log('📦 Pedidos procesados:', pedidosData.length);
      setPedidos(pedidosData);
    } catch (err: any) {
      console.error('❌ Error al cargar pedidos:', err);
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      console.log('🏁 Finalizando carga de pedidos');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [filtros.page, filtros.size]); // Solo recargar cuando cambia la paginación

  // Manejar cambios en filtros (sin recargar automáticamente)
  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  // Aplicar filtros manualmente
  const aplicarFiltros = () => {
    setFiltros(prev => ({ ...prev, page: 0 }));
    cargarPedidos();
  };

  // Obtener color según estado
  const getEstadoColor = (estado: EstadoPedido) => {
    switch (estado) {
      case EstadoPedido.ASIGNADO:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoPedido.ACEPTADO:
        return 'bg-blue-100 text-blue-800';
      case EstadoPedido.EN_CAMINO:
        return 'bg-purple-100 text-purple-800';
      case EstadoPedido.CANCELADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear moneda
  const formatMoneda = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <p className="text-gray-600">Administra todos tus pedidos y su estado</p>
          </div>
          <Link href="/pedidos/crear">
            <Button variant="primary">
              ➕ Nuevo Pedido
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por cliente..."
              value={filtros.cliente}
              onChange={(e) => handleFiltroChange('cliente', e.target.value)}
              label="Cliente"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base focus:border-blue-500 focus:ring-blue-500"
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value={EstadoPedido.ASIGNADO}>Asignado</option>
                <option value={EstadoPedido.EN_CAMINO}>En Camino</option>
                <option value={EstadoPedido.ENTREGADO}>Entregado</option>
                <option value={EstadoPedido.CANCELADO}>Cancelado</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button 
                variant="primary" 
                onClick={aplicarFiltros}
                fullWidth
              >
                🔍 Aplicar Filtros
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setFiltros({ estado: '', cliente: '', page: 0, size: 10 });
                  cargarPedidos();
                }}
              >
                🔄 Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600">❌ {error}</div>
              <Button 
                variant="primary" 
                onClick={cargarPedidos}
                className="mt-4"
              >
                🔄 Reintentar
              </Button>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">📦 No hay pedidos encontrados</div>
              <Link href="/pedidos/crear">
                <Button variant="primary" className="mt-4">
                  ➕ Crear Primer Pedido
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pedido.numeroOrdenPyme}
                        </div>
                        {pedido.etiquetaDespachoPyme && (
                          <div className="text-sm text-gray-500">
                            {pedido.etiquetaDespachoPyme}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pedido.nombreCliente}</div>
                        <div className="text-sm text-gray-500">{pedido.emailCliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estadoPedidoPyme)}`}>
                          {pedido.estadoPedidoPyme.replace('_CHILE', '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMoneda(pedido.totalPedido)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pedido.creadoEn).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/pedidos/${pedido.id}`}>
                            <Button variant="secondary" size="sm">
                              👁️ Ver
                            </Button>
                          </Link>
                          <Button variant="primary" size="sm">
                            ✏️ Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {pedidos.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando {pedidos.length} pedidos
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={filtros.page === 0}
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ⬅️ Anterior
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Siguiente ➡️
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
