// Página de creación de productos con formulario completo

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/productos/ImageUpload';
import { Producto } from '@/types';
import { apiClient } from '@/lib/api';

interface ProductoForm {
  codigoSKU: string;
  nombreProducto: string;
  descripcionProducto: string;
  precioVentaChile: number;
  pesoProductoKg: number;
  dimensionesProducto: string;
  imagenUrl: string;
  activo: boolean;
}

export default function CrearProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<ProductoForm>({
    codigoSKU: '',
    nombreProducto: '',
    descripcionProducto: '',
    precioVentaChile: 0,
    pesoProductoKg: 0,
    dimensionesProducto: '',
    imagenUrl: '',
    activo: true
  });

  // Estado para validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejar cambios en el formulario
  const handleInputChange = (campo: keyof ProductoForm, valor: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[campo]) {
      setErrors(prev => ({ ...prev, [campo]: '' }));
    }
  };

  // Manejar upload de imagen
  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imagenUrl: imageUrl }));
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Validar código SKU
    if (!formData.codigoSKU.trim()) {
      nuevosErrores.codigoSKU = 'El código SKU es requerido';
    } else if (formData.codigoSKU.length < 3) {
      nuevosErrores.codigoSKU = 'El código SKU debe tener al menos 3 caracteres';
    }

    // Validar nombre del producto
    if (!formData.nombreProducto.trim()) {
      nuevosErrores.nombreProducto = 'El nombre del producto es requerido';
    } else if (formData.nombreProducto.length < 3) {
      nuevosErrores.nombreProducto = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar precio
    if (!formData.precioVentaChile || formData.precioVentaChile <= 0) {
      nuevosErrores.precioVentaChile = 'El precio debe ser mayor a 0';
    }

    // Validar peso (opcional pero si se ingresa debe ser válido)
    if (formData.pesoProductoKg < 0) {
      nuevosErrores.pesoProductoKg = 'El peso no puede ser negativo';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
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
      // Preparar datos para enviar
      const productoData = {
        ...formData,
        pymeId: 1, // ID de la PYME actual (hardcodeado por ahora)
        precioVentaChile: Number(formData.precioVentaChile),
        pesoProductoKg: Number(formData.pesoProductoKg) || 0
      };

      console.log('Enviando producto:', productoData);
      
      // Temporalmente simular creación exitosa
      // const response = await apiClient.post('/productos', productoData);
      
      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/productos');
      }, 2000);
      
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError('Error al crear el producto. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatear moneda
  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
            <p className="text-gray-600 mt-1">
              Completa los datos para agregar un nuevo producto a tu catálogo
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push('/productos')}
          >
            ← Volver
          </Button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Producto Creado!</h3>
                <p className="mt-1 text-sm text-green-700">
                  El producto ha sido creado exitosamente. Redirigiendo...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código SKU */}
              <div>
                <Input
                  label="Código SKU *"
                  placeholder="Ej: LAPTOP-001"
                  value={formData.codigoSKU}
                  onChange={(e) => handleInputChange('codigoSKU', e.target.value)}
                  error={errors.codigoSKU}
                  helperText="Código único para identificar el producto"
                  required
                />
              </div>

              {/* Nombre del producto */}
              <div>
                <Input
                  label="Nombre del Producto *"
                  placeholder="Ej: Laptop Gamer Pro"
                  value={formData.nombreProducto}
                  onChange={(e) => handleInputChange('nombreProducto', e.target.value)}
                  error={errors.nombreProducto}
                  helperText="Nombre descriptivo del producto"
                  required
                />
              </div>

              {/* Precio */}
              <div>
                <Input
                  label="Precio de Venta *"
                  type="number"
                  placeholder="0"
                  value={formData.precioVentaChile}
                  onChange={(e) => handleInputChange('precioVentaChile', Number(e.target.value))}
                  error={errors.precioVentaChile}
                  helperText={`Precio en pesos chilenos (${formatMoneda(0)})`}
                  required
                />
              </div>

              {/* Peso */}
              <div>
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.pesoProductoKg}
                  onChange={(e) => handleInputChange('pesoProductoKg', Number(e.target.value))}
                  error={errors.pesoProductoKg}
                  helperText="Peso del producto en kilogramos"
                />
              </div>

              {/* Dimensiones */}
              <div className="md:col-span-2">
                <Input
                  label="Dimensiones"
                  placeholder="Ej: 35 x 25 x 2.5 cm"
                  value={formData.dimensionesProducto}
                  onChange={(e) => handleInputChange('dimensionesProducto', e.target.value)}
                  helperText="Dimensiones del producto (largo x ancho x alto)"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Producto
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A] sm:text-sm"
                  placeholder="Describe las características principales del producto..."
                  value={formData.descripcionProducto}
                  onChange={(e) => handleInputChange('descripcionProducto', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Incluye detalles importantes del producto (máximo 500 caracteres)
                </p>
              </div>
            </div>
          </div>

          {/* Imagen del producto */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Imagen del Producto</h2>
            
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={formData.imagenUrl}
              className="w-full"
            />
            
            <p className="mt-2 text-xs text-gray-500">
              Formatos permitidos: JPG, PNG, WebP. Tamaño máximo: 5MB
            </p>
          </div>

          {/* Estado del producto */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Estado del Producto</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                checked={formData.activo}
                onChange={(e) => handleInputChange('activo', e.target.checked)}
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Producto activo
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Los productos activos aparecerán en el catálogo y estarán disponibles para venta
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/productos')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </span>
              ) : (
                'Crear Producto'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
