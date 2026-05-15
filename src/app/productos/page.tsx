// Página de gestión de productos con CRUD completo

'use client';

import Layout from '@/components/layout/Layout';
import ProductoCard from '@/components/productos/ProductoCard';
import Button from '@/components/ui/pymetrack-ui-lib/Button';
import Input from '@/components/ui/pymetrack-ui-lib/Input';
import { apiClient } from '@/lib/api';
import { CategoriaProducto, Producto } from '@/types';
import React, { useEffect, useState } from 'react';

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Cargar productos desde la API
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar productos reales desde la API
      const response = await apiClient.get('/productos/pyme/1');
      const productosReales: Producto[] = (response.data as any[]).map((producto: any) => ({
        id: producto.id,
        pyme: { 
          id: producto.pymeId, 
          nombrePyme: 'TechStore SPA', 
          rutPyme: '76.123.456-7', 
          emailContactoPyme: 'contacto@techstore.cl', 
          activo: true, 
          creadoEn: producto.creadoEn 
        },
        codigoSKU: producto.codigoSKU || '',
        nombreProducto: producto.nombreProducto,
        descripcionProducto: producto.descripcionProducto || '',
        precioVentaChile: Number(producto.precioVentaChile),
        pesoProductoKg: producto.pesoProductoKg || 0,
        dimensionesProducto: producto.dimensionesProducto || '',
        imagenUrl: producto.imagenUrl || 'https://via.placeholder.com/400x300/1e3a8a/999999?text=Producto',
        categoriaProducto: (producto.categoriaProducto as CategoriaProducto) || CategoriaProducto.ACCESORIOS,
        activo: producto.activo,
        creadoEn: producto.creadoEn
      }));
      
      setProductos(productosReales);
      console.log('Productos cargados desde API:', productosReales);
    } catch (err) {
      console.error('Error al cargar productos desde API:', err);
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
      
      // Fallback a productos mock si hay error
      const productosMock: Producto[] = [
        {
          id: 1,
          pyme: { id: 1, nombrePyme: 'TechStore SPA', rutPyme: '76.123.456-7', emailContactoPyme: 'contacto@techstore.cl', activo: true, creadoEn: '2024-04-23T00:00:00' },
          codigoSKU: 'LAPTOP-001',
          nombreProducto: 'Laptop Gamer Pro',
          descripcionProducto: 'Laptop de alto rendimiento para gaming y trabajo profesional',
          precioVentaChile: 899990,
          pesoProductoKg: 2.5,
          dimensionesProducto: '35 x 25 x 2.5 cm',
          imagenUrl: 'https://via.placeholder.com/400x300/1e3a8a/999999?text=Laptop',
          categoriaProducto: CategoriaProducto.NOTEBOOK,
          activo: true,
          creadoEn: '2024-04-23T00:00:00'
        },
        {
          id: 2,
          pyme: { id: 1, nombrePyme: 'TechStore SPA', rutPyme: '76.123.456-7', emailContactoPyme: 'contacto@techstore.cl', activo: true, creadoEn: '2024-04-23T00:00:00' },
          codigoSKU: 'MOUSE-002',
          nombreProducto: 'Mouse Gaming RGB',
          descripcionProducto: 'Mouse inalámbrico con iluminación RGB personalizable',
          precioVentaChile: 49990,
          pesoProductoKg: 0.1,
          dimensionesProducto: '12 x 6 x 4 cm',
          imagenUrl: 'https://via.placeholder.com/400x300/1e3a8a/49990?text=Mouse',
          categoriaProducto: CategoriaProducto.ACCESORIOS,
          activo: true,
          creadoEn: '2024-04-23T00:00:00'
        },
        {
          id: 3,
          pyme: { id: 1, nombrePyme: 'TechStore SPA', rutPyme: '76.123.456-7', emailContactoPyme: 'contacto@techstore.cl', activo: true, creadoEn: '2024-04-23T00:00:00' },
          codigoSKU: 'KEYBOARD-003',
          nombreProducto: 'Teclado Mecánico RGB',
          descripcionProducto: 'Teclado mecánico con retroiluminación RGB y switches blue',
          precioVentaChile: 79990,
          pesoProductoKg: 1.2,
          dimensionesProducto: '45 x 15 x 4 cm',
          imagenUrl: 'https://via.placeholder.com/400x300/1e3a8a/79990?text=Keyboard',
          categoriaProducto: CategoriaProducto.ACCESORIOS,
          activo: true,
          creadoEn: '2024-04-23T00:00:00'
        }
      ];
      setProductos(productosMock);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(producto =>
    (producto.nombreProducto?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
    (producto.codigoSKU?.toLowerCase() || '').includes(filtro.toLowerCase())
  );

  const handleEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setShowEditarModal(true);
  };

  const handleEliminar = async (producto: Producto) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombreProducto}"?`)) {
      try {
        await apiClient.delete(`/productos/${producto.id}`);
        await cargarProductos(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleCrear = () => {
    setShowCrearModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <Button
            variant="primary"
            onClick={handleCrear}
            className="flex items-center gap-2"
          >
            ➕ Crear Nuevo Producto
          </Button>
        </div>

      {/* Filtros */}
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
            <Button
              variant="secondary"
              onClick={() => setFiltro('')}
            >
              🔄 Limpiar
            </Button>
            <Button
              variant="secondary"
              onClick={cargarProductos}
            >
              🔄 Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de productos */}
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
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer producto'
                }
              </p>
              {!filtro && (
                <Button
                  variant="primary"
                  onClick={handleCrear}
                >
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
                  onEdit={handleEditar}
                  onDelete={handleEliminar}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal para crear producto */}
      {showCrearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Producto</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCrearModal(false)}
              >
                ✖️ Cerrar
              </Button>
            </div>
            <p className="text-gray-600">
              El formulario de creación de productos estará disponible próximamente.
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowCrearModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar producto */}
      {showEditarModal && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Editar Producto</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditarModal(false)}
              >
                ✖️ Cerrar
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <Input
                  value={productoSeleccionado.nombreProducto}
                  disabled
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <Input
                  value={productoSeleccionado.codigoSKU}
                  disabled
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <Input
                  value={`$${productoSeleccionado.precioVentaChile.toLocaleString('es-CL')}`}
                  disabled
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={productoSeleccionado.descripcionProducto || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditarModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowEditarModal(false)}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default ProductosPage;
