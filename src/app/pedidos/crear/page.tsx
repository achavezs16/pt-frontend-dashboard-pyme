'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function CrearPedidoPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    direccionEntregaChile: '',
    comunaEntregaChile: '',
    regionEntregaChile: '',
    subtotal: '',
    costoDespachoChile: '',
    notasPedido: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const pymeInfo = localStorage.getItem('pymeInfo');

      const parsedPymeInfo =
        pymeInfo ? JSON.parse(pymeInfo) : null;

      const pymeId =
        parsedPymeInfo?.pymeId ||
        parsedPymeInfo?.id ||
        parsedPymeInfo?.userInfo?.pymeId ||
        1;

      const subtotal =
        Number(formData.subtotal);

      const costoDespacho =
        Number(formData.costoDespachoChile || 0);

      const pedidoData = {

        idPyme: pymeId,

        numeroOrdenPyme:
          `ORD-${Date.now()}`,

        nombreCliente:
          formData.nombreCliente,

        emailCliente:
          formData.emailCliente,

        telefonoCliente:
          formData.telefonoCliente,

        direccionEntregaChile:
          formData.direccionEntregaChile,

        comunaEntregaChile:
          formData.comunaEntregaChile,

        regionEntregaChile:
          formData.regionEntregaChile,

        estadoPedidoPyme:
          'DISPONIBLE',

        subtotal,

        costoDespachoChile:
          costoDespacho,

        totalPedido:
          subtotal + costoDespacho,

        etiquetaDespachoPyme:
          `PYM-${Date.now()}`,

        notasPedido:
          formData.notasPedido || '',
      };

      console.log(
        '📦 Creando pedido:',
        pedidoData
      );

      await apiClient.post(
        '/pedidos',
        pedidoData
      );

      alert('✅ Pedido creado exitosamente');

      router.push('/pedidos');

    } catch (err: any) {

      console.error(
        '❌ Error al crear pedido:',
        err
      );

      alert(
        err?.message ||
        'Error al crear pedido'
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="max-w-3xl mx-auto p-6">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Crear Pedido
        </h1>

        <p className="text-gray-600 mt-2">
          Registra un nuevo pedido para despacho.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
      >

        {/* Cliente */}
        <div>

          <h2 className="text-xl font-semibold mb-4">
            Datos del Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              name="nombreCliente"
              placeholder="Nombre Cliente"
              value={formData.nombreCliente}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="email"
              name="emailCliente"
              placeholder="Correo Cliente"
              value={formData.emailCliente}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="text"
              name="telefonoCliente"
              placeholder="Teléfono"
              value={formData.telefonoCliente}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-3"
            />

          </div>

        </div>

        {/* Dirección */}
        <div>

          <h2 className="text-xl font-semibold mb-4">
            Dirección de Entrega
          </h2>

          <div className="grid grid-cols-1 gap-4">

            <input
              type="text"
              name="direccionEntregaChile"
              placeholder="Dirección"
              value={formData.direccionEntregaChile}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                name="comunaEntregaChile"
                placeholder="Comuna"
                value={formData.comunaEntregaChile}
                onChange={handleChange}
                required
                className="border rounded-lg px-4 py-3"
              />

              <input
                type="text"
                name="regionEntregaChile"
                placeholder="Región"
                value={formData.regionEntregaChile}
                onChange={handleChange}
                required
                className="border rounded-lg px-4 py-3"
              />

            </div>

          </div>

        </div>

        {/* Totales */}
        <div>

          <h2 className="text-xl font-semibold mb-4">
            Totales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="number"
              name="subtotal"
              placeholder="Subtotal"
              value={formData.subtotal}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="number"
              name="costoDespachoChile"
              placeholder="Costo despacho"
              value={formData.costoDespachoChile}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3"
            />

          </div>

        </div>

        {/* Notas */}
        <div>

          <textarea
            name="notasPedido"
            placeholder="Notas adicionales"
            value={formData.notasPedido}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-4 py-3"
          />

        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Creando pedido...'
              : 'Crear Pedido'}
          </button>

        </div>

      </form>

    </div>
  );
}
