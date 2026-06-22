'use client';

import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiClient } from '@/lib/api';

type Producto = {
  id: number;
  codigoSKU: string;
  nombreProducto: string;
  descripcionProducto?: string;
  precioVentaChile: number;
  activo: boolean;
};

type InventarioItem = {
  id?: number;
  productoId: number;
  stockDisponible: number;
  stockReservado: number;
  stockTotal?: number;
  ultimoActualizado?: string;
};

type InventarioRow = {
  producto: Producto;
  inventario: InventarioItem | null;
};

export default function InventarioPage() {
  const [rows, setRows] = useState<InventarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError(null);

      const pymeId = obtenerPymeId();

      if (!pymeId) {
        setError('No se pudo identificar la PYME. Vuelve a iniciar sesión.');
        setRows([]);
        return;
      }

      const productosResponse = await apiClient.get<Producto[]>(`/productos/pyme/${pymeId}`);
      const productos = productosResponse.data || [];

      const inventarioRows = await Promise.all(
        productos.map(async (producto) => {
          try {
            const inventarioResponse = await apiClient.get<InventarioItem>(
              `/inventario/producto/${producto.id}`
            );

            return {
              producto,
              inventario: inventarioResponse.data,
            };
          } catch {
            return {
              producto,
              inventario: {
                productoId: producto.id,
                stockDisponible: 0,
                stockReservado: 0,
                stockTotal: 0,
                ultimoActualizado: undefined,
              },
            };
          }
        })
      );

      setRows(inventarioRows);
    } catch (err) {
      console.error('Error cargando inventario:', err);
      setError('No fue posible cargar el inventario.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const rowsFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return rows;

    return rows.filter(({ producto }) =>
      producto.nombreProducto.toLowerCase().includes(texto) ||
      producto.codigoSKU.toLowerCase().includes(texto)
    );
  }, [rows, busqueda]);

  const totalDisponible = rows.reduce(
    (total, row) => total + (row.inventario?.stockDisponible || 0),
    0
  );

  const totalReservado = rows.reduce(
    (total, row) => total + (row.inventario?.stockReservado || 0),
    0
  );

  const productosSinStock = rows.filter(
    (row) => (row.inventario?.stockDisponible || 0) === 0
  ).length;

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return 'bg-red-100 text-red-800';
    }

    if (stock <= 5) {
      return 'bg-yellow-100 text-yellow-800';
    }

    return 'bg-green-100 text-green-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600 mt-1">
              Revisa el stock disponible y reservado de tus productos.
            </p>
          </div>

          <Button variant="secondary" onClick={cargarInventario}>
            🔄 Actualizar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Stock disponible total</p>
            <p className="text-3xl font-black text-green-700 mt-2">
              {totalDisponible}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Stock reservado</p>
            <p className="text-3xl font-black text-yellow-700 mt-2">
              {totalReservado}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Productos sin stock</p>
            <p className="text-3xl font-black text-red-700 mt-2">
              {productosSinStock}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <Input
            placeholder="Buscar producto por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Cargando inventario...
            </div>
          ) : rowsFiltradas.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No hay productos en inventario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      Disponible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      Reservado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      Última actualización
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rowsFiltradas.map(({ producto, inventario }) => {
                    const disponible = inventario?.stockDisponible || 0;
                    const reservado = inventario?.stockReservado || 0;
                    const total =
                      inventario?.stockTotal ?? disponible + reservado;

                    return (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {producto.nombreProducto}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {producto.descripcionProducto || 'Sin descripción'}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {producto.codigoSKU}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getStockBadge(
                              disponible
                            )}`}
                          >
                            {disponible}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-yellow-700">
                          {reservado}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {total}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {inventario?.ultimoActualizado
                            ? new Date(inventario.ultimoActualizado).toLocaleString('es-CL')
                            : 'Sin registro'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}