// Componente ProductoCard con imagen y acciones para gestión de productos

'use client';

import React from 'react';
import Image from 'next/image';
import { Producto } from '@/types';
import Button from '@/components/ui/Button';

interface ProductoCardProps {
  producto: Producto;
  onEdit?: (producto: Producto) => void;
  onDelete?: (producto: Producto) => void;
  onSelect?: (producto: Producto) => void;
  showActions?: boolean;
  showSelect?: boolean;
}

const ProductoCard: React.FC<ProductoCardProps> = ({
  producto,
  onEdit,
  onDelete,
  onSelect,
  showActions = true,
  showSelect = false
}) => {
  const imagenProducto = producto.imagenUrl || '/placeholder-product.jpg';
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(producto);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(producto);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(producto);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Image
          src={imagenProducto}
          alt={producto.nombreProducto}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
        />
        
        {/* Badge de estado */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            producto.activo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {producto.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {producto.nombreProducto}
            </h3>
            <p className="text-sm text-gray-500">
              SKU: {producto.codigoSKU}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1E3A8A]">
              {producto.precioVentaChile.toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP'
              })}
            </p>
          </div>
        </div>

        {/* Descripción */}
        {producto.descripcionProducto && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {producto.descripcionProducto}
          </p>
        )}

        {/* Información adicional */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          {producto.pesoProductoKg && (
            <span className="mr-4">
              📦 {producto.pesoProductoKg} kg
            </span>
          )}
          {producto.dimensionesProducto && (
            <span>
              📐 {producto.dimensionesProducto}
            </span>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              ✏️ Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="flex-1"
            >
              🗑️ Eliminar
            </Button>
          </div>
        )}

        {/* Botón de selección para pedidos */}
        {showSelect && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSelect}
            fullWidth
            className="mt-3"
          >
            🛒 Seleccionar para Pedido
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductoCard;
