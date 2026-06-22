// Página de gestión de productos con CRUD básico real + inventario

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Producto, CategoriaProducto } from '@/types';
import ProductoCard from '@/components/productos/ProductoCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

type ProductoConStock = Producto & {
  stockDisponible?: number;
  stockReservado?: number;
};

const ProductosPage: React.FC = () => {
  const router = useRouter();

  const [productos, setProductos] = useState<ProductoConStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConStock | null>(null);

  const obtenerPymeId = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    return (
      userInfo.pymeId ??
      userInfo.idPyme ??
      userInfo.pyme_id ??
      userInfo.id
    );
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      const pymeId = obtenerPymeId();

      if (!pymeId) {
        setProductos([]);
        setError('No se pudo identificar la PYME. Vuelve a iniciar sesión.');
        return;
      }

      const response = await apiClient.get(`/productos/pyme/${pymeId}`);

      const productosReales: ProductoConStock[] = await Promise.all(
        (response.data as any[]).map(async (producto: any) => {
          let inventario: any = null;

          try {
            const inventarioResponse = await apiClient.get(
              `/inventario/producto/${producto.id}`
            );

            inventario = inventarioResponse.data;
          } catch (error) {
            console.warn(
              `No se pudo cargar inventario para producto ${producto.id}`,
              error
            );
          }

          return {
            id: producto.id,
            pyme: {
              id: producto.pymeId ?? producto.idPyme ?? pymeId,
              nombrePyme: 'PYME actual',
              rutPyme: '',
              emailContactoPyme: '',
              activo: true,
              creadoEn: producto.creadoEn,
            },
            codigoSKU: producto.codigoSKU || '',
            nombreProducto: producto.nombreProducto,
            descripcionProducto: producto.descripcionProducto || '',
            precioVentaChile: Number(producto.precioVentaChile || 0),
            pesoProductoKg: producto.pesoProductoKg || 0,
            dimensionesProducto: producto.dimensionesProducto || '',
            imagenUrl: producto.imagenUrl || '/placeholder-producto.jpg',
            categoriaProducto:
              (producto.categoriaProducto as CategoriaProducto) ||
              CategoriaProducto.ACCESORIOS,
            activo: producto.activo,
            creadoEn: producto.creadoEn,
            stockDisponible: inventario?.stockDisponible ?? 0,
            stockReservado: inventario?.stockReservado ?? 0,
          };
        })
      );

      setProductos(productosReales);
      console.log('Productos cargados con inventario:', productosReales);
    } catch (err) {
      console.error('Error al cargar productos desde API:', err);
      setProductos([]);
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter(
    (producto) =>
      (producto.nombreProducto?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      (producto.codigoSKU?.toLowerCase() || '').includes(filtro.toLowerCase())
  );

  const handleCrear = () => {
    router.push('/productos/crear');
  };

  const handleEditar = (producto: ProductoConStock) => {
    setProductoSeleccionado(producto);
    setShowEditarModal(true);
  };

  const handleEliminar = async (producto: ProductoConStock) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar el producto "${producto.nombreProducto}"?`
      )
    ) {
      try {
        await apiClient.delete(`/productos/${producto.id}`);
        await cargarProductos();
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra el catálogo asociado a tu PYME.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleCrear}
            className="flex items-center gap-2"
          >
            ➕ Crear Nuevo Producto
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFiltro('')}>
                🔄 Limpiar
              </Button>

              <Button variant="secondary" onClick={cargarProductos}>
                🔄 Actualizar
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-6xl mb-4">📦</div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filtro ? 'No se encontraron productos' : 'No hay productos registrados'}
                </h3>

                <p className="text-gray-600 mb-4">
                  {filtro
                    ? 'Intenta con otros términos de búsqueda.'
                    : 'Comienza agregando tu primer producto.'}
                </p>

                {!filtro && (
                  <Button variant="primary" onClick={handleCrear}>
                    ➕ Crear Primer Producto
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    stockDisponible={producto.stockDisponible}
                    stockReservado={producto.stockReservado}
                    onEdit={handleEditar}
                    onDelete={handleEliminar}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      {showEditarModal && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Editar producto
              </h2>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditarModal(false)}
              >
                ✖️ Cerrar
              </Button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  await apiClient.put(`/productos/${productoSeleccionado.id}`, {
                    nombreProducto: productoSeleccionado.nombreProducto,
                    descripcionProducto: productoSeleccionado.descripcionProducto,
                    precioVentaChile: productoSeleccionado.precioVentaChile,
                    pesoProductoKg: productoSeleccionado.pesoProductoKg,
                    dimensionesProducto: productoSeleccionado.dimensionesProducto,
                    imagenUrl: productoSeleccionado.imagenUrl,
                    categoriaProducto: productoSeleccionado.categoriaProducto,
                    codigoSKU: productoSeleccionado.codigoSKU,
                    idPyme: productoSeleccionado.pyme?.id,
                    activo: productoSeleccionado.activo,
                  });

                  alert('✅ Producto actualizado correctamente');
                  setShowEditarModal(false);
                  setProductoSeleccionado(null);
                  await cargarProductos();
                } catch (err) {
                  console.error('Error al actualizar producto:', err);
                  alert('No se pudo actualizar el producto.');
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto
                </label>
                <Input
                  value={productoSeleccionado.nombreProducto}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      nombreProducto: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <Input
                  value={productoSeleccionado.codigoSKU}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      codigoSKU: e.target.value,
                    })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nota: el backend actual no actualiza SKU en ProductoService. Se puede dejar visible o agregarlo al service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <Input
                    type="number"
                    value={productoSeleccionado.precioVentaChile}
                    onChange={(e) =>
                      setProductoSeleccionado({
                        ...productoSeleccionado,
                        precioVentaChile: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso kg
                  </label>
                  <Input
                    type="number"
                    value={productoSeleccionado.pesoProductoKg || 0}
                    onChange={(e) =>
                      setProductoSeleccionado({
                        ...productoSeleccionado,
                        pesoProductoKg: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensiones
                </label>
                <Input
                  value={productoSeleccionado.dimensionesProducto || ''}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      dimensionesProducto: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL imagen
                </label>
                <Input
                  value={productoSeleccionado.imagenUrl || ''}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      imagenUrl: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-50 px-3 py-2 border border-green-100">
                  <p className="text-xs text-gray-500 mt-1">
                    El stock se administra automáticamente desde inventario y pedidos.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={productoSeleccionado.descripcionProducto || ''}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      descripcionProducto: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditarModal(false)}
                >
                  Cancelar
                </Button>

                <Button type="submit" variant="primary">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </Layout>
  );
};

export default ProductosPage;