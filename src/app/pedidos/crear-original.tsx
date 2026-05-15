// Página de creación de pedidos del Portal PYME

'use client';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/pymetrack-ui-lib/Button';
import Input from '@/components/ui/pymetrack-ui-lib/Input';
import { CrearPedidoRequest, DetallePedidoRequest } from '@/types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function CrearPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<CrearPedidoRequest>({
    pymeId: 1, // Hardcodeado por ahora, luego se obtendrá del usuario logueado
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    direccionEntrega: '',
    comunaEntrega: '',
    regionEntrega: '',
    subtotal: 0,
    costoEnvio: 0,
    detalles: [],
    notas: ''
  });

  // Estado para el formulario de productos
  const [nuevoDetalle, setNuevoDetalle] = useState<DetallePedidoRequest>({
    productoId: 0,
    cantidad: 1,
    precioUnitario: 0
  });

  // Manejar cambios en el formulario principal
  const handleInputChange = (campo: keyof CrearPedidoRequest, valor: string | number | DetallePedidoRequest[]) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Calcular total automáticamente cuando cambian subtotal o costo envío
    if (campo === 'subtotal' || campo === 'costoEnvio') {
      const nuevoSubtotal = campo === 'subtotal' ? Number(valor) : formData.subtotal;
      const nuevoCostoEnvio = campo === 'costoEnvio' ? Number(valor) : formData.costoEnvio || 0;
      
      // Recalcular subtotal basado en detalles
      const subtotalDetalles = formData.detalles.reduce((sum, detalle) => 
        sum + (detalle.precioUnitario * detalle.cantidad), 0
      );
      
      setFormData(prev => ({
        ...prev,
        subtotal: subtotalDetalles,
        costoEnvio: nuevoCostoEnvio
      }));
    }
  };

  // Manejar cambios en el formulario de productos
  const handleDetalleChange = (campo: keyof DetallePedidoRequest, valor: string | number) => {
    setNuevoDetalle(prev => ({ ...prev, [campo]: Number(valor) }));
  };

  // Agregar producto a la lista
  const agregarDetalle = () => {
    if (nuevoDetalle.productoId > 0 && nuevoDetalle.cantidad > 0 && nuevoDetalle.precioUnitario > 0) {
      setFormData(prev => ({
        ...prev,
        detalles: [...prev.detalles, nuevoDetalle]
      }));
      
      // Resetear formulario de producto
      setNuevoDetalle({
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0
      });
    }
  };

  // Eliminar producto de la lista
  const eliminarDetalle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const camposRequeridos = [
      'numeroOrdenPyme',
      'nombreCliente', 
      'emailCliente',
      'direccionEntregaChile',
      'comunaEntregaChile',
      'regionEntregaChile'
    ];

    for (const campo of camposRequeridos) {
      if (!formData[campo as keyof CrearPedidoRequest]) {
        setError(`El campo ${campo} es requerido`);
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailCliente)) {
      setError('El email no es válido');
      return false;
    }

    // Validar que el subtotal sea mayor a 0
    if (formData.subtotal <= 0) {
      setError('El subtotal debe ser mayor a 0');
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

    try {
      setLoading(true);
      setError(null);

      // Simular creación de pedido (mientras la API no está disponible)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // const response = await apiClient.crearPedido(formData);
      
      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/pedidos');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Generar número de orden automático
  const generarNumeroOrden = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const numeroOrden = `ORD-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, numeroOrdenPyme: numeroOrden }));
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
              El pedido {formData.numeroOrdenPyme} ha sido creado correctamente.
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
          {/* Información del Pedido */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Pedido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      label="Número de Orden"
                      placeholder="Ej: ORD-001"
                      value={formData.numeroOrdenPyme}
                      onChange={(e) => handleInputChange('numeroOrdenPyme', e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="secondary" 
                    onClick={generarNumeroOrden}
                  >
                    🎲 Generar
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Notas del Pedido"
                  placeholder="Notas adicionales sobre el pedido..."
                  value={formData.notasPedido}
                  onChange={(e) => handleInputChange('notasPedido', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Cliente"
                placeholder="Ej: Juan Pérez"
                value={formData.nombreCliente}
                onChange={(e) => handleInputChange('nombreCliente', e.target.value)}
                required
              />
              
              <Input
                label="Email del Cliente"
                placeholder="Ej: juan.perez@email.com"
                type="email"
                value={formData.emailCliente}
                onChange={(e) => handleInputChange('emailCliente', e.target.value)}
                required
              />
              
              <Input
                label="Teléfono del Cliente"
                placeholder="Ej: +56 9 1234 5678"
                value={formData.telefonoCliente}
                onChange={(e) => handleInputChange('telefonoCliente', e.target.value)}
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
                  value={formData.direccionEntregaChile}
                  onChange={(e) => handleInputChange('direccionEntregaChile', e.target.value)}
                  required
                />
              </div>
              
              <Input
                label="Comuna"
                placeholder="Ej: Santiago"
                value={formData.comunaEntregaChile}
                onChange={(e) => handleInputChange('comunaEntregaChile', e.target.value)}
                required
              />
              
              <Input
                label="Región"
                placeholder="Ej: Región Metropolitana"
                value={formData.regionEntregaChile}
                onChange={(e) => handleInputChange('regionEntregaChile', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Información de Pago */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Subtotal"
                type="number"
                placeholder="0"
                value={formData.subtotal}
                onChange={(e) => handleInputChange('subtotal', Number(e.target.value))}
                required
                helperText="Valor de los productos sin despacho"
              />
              
              <Input
                label="Costo de Despacho"
                type="number"
                placeholder="0"
                value={formData.costoDespachoChile}
                onChange={(e) => handleInputChange('costoDespachoChile', Number(e.target.value))}
                helperText="Costo de envío a la dirección indicada"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total del Pedido
                </label>
                <div className="block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-base font-semibold text-gray-900">
                  {formatMoneda(formData.totalPedido)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Subtotal + Costo Despacho
                </p>
              </div>
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
