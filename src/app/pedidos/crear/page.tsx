// Página simplificada de creación de pedidos del Portal PYME

'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Producto } from '@/types';
import ProductSelector from '@/components/productos/ProductSelector';

interface PedidoSimple {
  pymeId: number;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  direccionEntrega: string;
  comunaEntrega: string;
  regionEntrega: string;
  subtotal: number;
  costoEnvio: number;
  notas?: string;
  detalles: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export default function CrearPedidoSimplePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{ producto: Producto; cantidad: number }>>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<PedidoSimple>({
    pymeId: 1,
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    direccionEntrega: '',
    comunaEntrega: '',
    regionEntrega: '',
    subtotal: 0,
    costoEnvio: 0,
    notas: '',
    detalles: []
  });

  // Manejar cambios en el formulario
  const handleInputChange = (campo: string, valor: string | number) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  // Manejar selección de productos
  const handleProductSelect = (producto: Producto, cantidad: number) => {
    const existingIndex = selectedProducts.findIndex(p => p.producto.id === producto.id);
    let newSelectedProducts;
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      newSelectedProducts = [...selectedProducts];
      newSelectedProducts[existingIndex].cantidad += cantidad;
    } else {
      // Agregar nuevo producto
      newSelectedProducts = [...selectedProducts, { producto, cantidad }];
    }
    
    setSelectedProducts(newSelectedProducts);
    
    // Actualizar subtotal con el nuevo estado
    const nuevoSubtotal = newSelectedProducts.reduce((acc, p) => acc + (p.cantidad * p.producto.precioVentaChile), 0);
    setFormData(prev => ({ ...prev, subtotal: nuevoSubtotal }));
  };

  // Manejar eliminación de productos
  const handleRemoveProduct = (productoId: number) => {
    const newSelectedProducts = selectedProducts.filter(p => p.producto.id !== productoId);
    setSelectedProducts(newSelectedProducts);
    
    // Actualizar subtotal
    const nuevoSubtotal = newSelectedProducts.reduce((acc, p) => acc + (p.cantidad * p.producto.precioVentaChile), 0);
    setFormData(prev => ({ ...prev, subtotal: nuevoSubtotal }));
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (!formData.clienteNombre) {
      setError('El nombre del cliente es requerido');
      return false;
    }

    if (!formData.clienteEmail) {
      setError('El email del cliente es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.clienteEmail)) {
      setError('El email no es válido');
      return false;
    }

    if (!formData.direccionEntrega) {
      setError('La dirección de entrega es requerida');
      return false;
    }

    if (!formData.comunaEntrega) {
      setError('La comuna de entrega es requerida');
      return false;
    }

    if (!formData.regionEntrega) {
      setError('La región de entrega es requerida');
      return false;
    }

    if (selectedProducts.length === 0) {
      setError('Debes seleccionar al menos un producto');
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mapear los datos del formulario al DTO esperado por el backend
      const pedidoData = {
        pymeId: 1, // ID de la PYME actual (hardcodeado por ahora)
        clienteNombre: formData.clienteNombre,
        clienteEmail: formData.clienteEmail,
        clienteTelefono: formData.clienteTelefono,
        direccionEntrega: formData.direccionEntrega,
        comunaEntrega: formData.comunaEntrega,
        regionEntrega: formData.regionEntrega,
        subtotal: Number(formData.subtotal) || 0,
        costoEnvio: Number(formData.costoEnvio) || 0,
        detalles: selectedProducts.map(p => ({
          productoId: p.producto.id,
          cantidad: p.cantidad,
          precioUnitario: Number(p.producto.precioVentaChile) || 0
        })),
        notas: formData.notas || ''
      };
      
      console.log('Enviando pedido:', JSON.stringify(pedidoData, null, 2));
      
      // Llamar a la API real
      const response = await apiClient.post('/pedidos/crearPedido', pedidoData);
      
      console.log('Pedido creado exitosamente:', response.data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/pedidos');
      }, 2000);
    } catch (err: any) {
      console.error('Error al crear pedido:', err);
      console.error('Error details:', {
        message: err?.message,
        status: err?.status,
        response: err?.response?.data,
        config: err?.config
      });
      
      // Mostrar error más específico
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Error al crear el pedido. Por favor, intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calcular total del pedido
  const calcularTotal = () => {
    const subtotal = selectedProducts.reduce((sum, p) => 
      sum + (p.producto.precioVentaChile * p.cantidad), 0
    );
    return subtotal + formData.costoEnvio;
  };

  // Formatear moneda
  const formatMoneda = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (success) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pedido Creado Exitosamente!
            </h1>
            <p className="text-gray-600 mb-4">
              El pedido ha sido creado correctamente.
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo a la lista de pedidos...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Pedido</h1>
          <p className="text-gray-600">Completa los datos para crear un nuevo pedido</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Cliente"
                placeholder="Ej: Juan Pérez"
                value={formData.clienteNombre}
                onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
                required
              />
              
              <Input
                label="Email del Cliente"
                placeholder="Ej: juan.perez@email.com"
                type="email"
                value={formData.clienteEmail}
                onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
                required
              />
              
              <Input
                label="Teléfono del Cliente"
                placeholder="Ej: +56 9 1234 5678"
                value={formData.clienteTelefono || ''}
                onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
              />
            </div>
          </div>

          {/* Dirección de Entrega */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de Entrega</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Dirección Completa"
                  placeholder="Ej: Av. Principal 123, Depto 4B"
                  value={formData.direccionEntrega}
                  onChange={(e) => handleInputChange('direccionEntrega', e.target.value)}
                  required
                />
              </div>
              
              <Input
                label="Comuna"
                placeholder="Ej: Santiago"
                value={formData.comunaEntrega}
                onChange={(e) => handleInputChange('comunaEntrega', e.target.value)}
                required
              />
              
              <Input
                label="Región"
                placeholder="Ej: Región Metropolitana"
                value={formData.regionEntrega}
                onChange={(e) => handleInputChange('regionEntrega', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Productos del Pedido */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos del Pedido</h2>
            
            <ProductSelector
              onProductSelect={handleProductSelect}
              onProductRemove={handleRemoveProduct}
              selectedProducts={selectedProducts}
            />
          </div>

          {/* Información de Pago */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal Productos
                </label>
                <div className="block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-base font-semibold text-gray-900">
                  {formatMoneda(formData.subtotal)}
                </div>
              </div>
              
              <Input
                label="Costo de Envío"
                type="number"
                placeholder="0"
                value={formData.costoEnvio}
                onChange={(e) => handleInputChange('costoEnvio', Number(e.target.value))}
                helperText="Costo de envío a la dirección indicada"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total del Pedido
                </label>
                <div className="block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-base font-semibold text-gray-900">
                  {formatMoneda(calcularTotal())}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Subtotal + Costo Envío
                </p>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas Adicionales</h2>
            
            <div className="md:col-span-2">
              <Input
                label="Notas del Pedido"
                placeholder="Notas adicionales sobre el pedido..."
                value={formData.notas || ''}
                onChange={(e) => handleInputChange('notas', e.target.value)}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => router.push('/pedidos')}
            >
              ❌ Cancelar
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creando Pedido...' : '✅ Crear Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
