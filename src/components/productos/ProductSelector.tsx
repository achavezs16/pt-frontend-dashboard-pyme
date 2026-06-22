// Componente ProductSelector para seleccionar productos en formulario de pedidos

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Producto, CategoriaProducto } from '@/types';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProductSelectorProps {
  onProductSelect: (producto: Producto, cantidad: number) => void;
  onProductRemove?: (productoId: number) => void;
  selectedProducts: Array<{ producto: Producto; cantidad: number }>;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  onProductRemove,
  selectedProducts
}) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Cargar productos desde la API
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);

      const userInfo = JSON.parse(
        localStorage.getItem('userInfo') || '{}'
      );

      const pymeId = userInfo.pymeId;

      console.log('🏢 PYME LOGUEADA:', pymeId);

      if (!pymeId) {
        throw new Error('No existe pymeId en localStorage');
      }

      const response = await apiClient.get(
        `/productos/pyme/${pymeId}`
      );

      const productosReales: Producto[] = (response.data as any[]).map(
        (producto: any) => ({
          id: producto.id,
          pyme: {
            id: producto.pymeId,
            nombrePyme: 'Pyme',
            rutPyme: '',
            emailContactoPyme: '',
            activo: true,
            creadoEn: producto.creadoEn
          },
          codigoSKU: producto.codigoSKU || '',
          nombreProducto: producto.nombreProducto,
          descripcionProducto: producto.descripcionProducto || '',
          precioVentaChile: Number(producto.precioVentaChile),
          pesoProductoKg: producto.pesoProductoKg || 0,
          dimensionesProducto: producto.dimensionesProducto || '',
          imagenUrl:
            producto.imagenUrl ||
            '/placeholder-product.jpg',
          categoriaProducto:
            (producto.categoriaProducto as CategoriaProducto) ||
            CategoriaProducto.ACCESORIOS,
          activo: producto.activo,
          creadoEn: producto.creadoEn
        })
      );

      console.log(
        '📦 Productos obtenidos:',
        productosReales.length
      );

      setProductos(productosReales);

    } catch (error) {
      console.error(
        '❌ Error al cargar productos:',
        error
      );

      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(producto =>
    (producto.nombreProducto?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
    (producto.codigoSKU?.toLowerCase() || '').includes(filtro.toLowerCase())
  );

  const handleProductClick = (producto: Producto) => {
    onProductSelect(producto, 1); // Por defecto cantidad 1
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className="space-y-4">
      {/* Header del selector */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Productos</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleModal}
        >
          📋 Ver Catálogo Completo
        </Button>
      </div>

      {/* Búsqueda rápida */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => handleProductClick(producto)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-lg"
            >
              <div className="flex space-x-4">
                {/* Imagen del producto */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={producto.imagenUrl || '/placeholder-product.jpg'}
                    alt={producto.nombreProducto}
                    fill
                    className="object-cover rounded-lg"
                    sizes="80px"
                  />
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {producto.nombreProducto}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    SKU: {producto.codigoSKU}
                  </p>
                  <p className="text-lg font-bold text-[#1E3A8A]">
                    {producto.precioVentaChile.toLocaleString('es-CL', {
                      style: 'currency',
                      currency: 'CLP'
                    })}
                  </p>
                  <p className="text-xs text-gray-600">
                    {producto.descripcionProducto}
                  </p>
                </div>
              </div>

              {/* Botón de selección */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleProductClick(producto)}
                  fullWidth
                  className="text-sm"
                >
                  ➕ Agregar al Pedido
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal con catálogo completo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Catálogo Completo de Productos</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleModal}
              >
                ✖️ Cerrar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => handleProductClick(producto)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex space-x-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={producto.imagenUrl || '/placeholder-product.jpg'}
                        alt={producto.nombreProducto}
                        fill
                        className="object-cover rounded-lg"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {producto.nombreProducto}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        SKU: {producto.codigoSKU}
                      </p>
                      <p className="text-lg font-bold text-[#1E3A8A]">
                        {producto.precioVentaChile.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        })}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {producto.descripcionProducto}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProductClick(producto)}
                      fullWidth
                    >
                      ➕ Agregar al Pedido
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Productos Seleccionados ({selectedProducts.length})
          </h4>
          <div className="space-y-2">
            {selectedProducts.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {item.producto.nombreProducto}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    x{item.cantidad}
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (onProductRemove) {
                      onProductRemove(item.producto.id);
                    }
                  }}
                >
                  🗑️
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
