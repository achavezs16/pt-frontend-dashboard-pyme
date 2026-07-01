'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { apiClient } from '@/lib/api';

type ProductoCatalogo = {
  id: number;
  pymeId: number;
  codigoSKU: string;
  nombreProducto: string;
  descripcionProducto?: string;
  precioVentaChile: number;
  categoriaProducto?: string;
  activo: boolean;
  stockDisponible?: number;
  stockReservado?: number;
};

type ProductoSeleccionado = {
  producto: ProductoCatalogo;
  cantidad: number;
};

export default function CrearPedidoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    direccionEntregaChile: '',
    comunaEntregaChile: '',
    regionEntregaChile: '',
    costoDespachoChile: '0',
    notasPedido: '',
  });

  const obtenerPymeId = () => {
    try {
      const userInfoRaw = localStorage.getItem('userInfo');

      if (!userInfoRaw) {
        console.error('No existe userInfo en localStorage');
        return null;
      }

      const userInfo = JSON.parse(userInfoRaw);

      return (
        userInfo.pymeId ??
        userInfo.idPyme ??
        userInfo.pyme_id ??
        null
      );
    } catch (error) {
      console.error('Error leyendo pymeId desde localStorage:', error);
      return null;
    }
  };

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProductos(true);
        setError(null);

        const pymeId = obtenerPymeId();

        if (!pymeId) {
          setProductos([]);
          setError('No se pudo identificar la PYME. Vuelve a iniciar sesión.');
          return;
        }

        const response = await apiClient.get<ProductoCatalogo[]>(`/productos/pyme/${pymeId}`);
        console.log('🏢 Cargando productos para PYME:', obtenerPymeId());

        const productosActivos = await Promise.all(
          response.data
            .filter((producto) => producto.activo)
            .map(async (producto) => {
              try {
                const token = localStorage.getItem('token');

                const inventarioResponse = await fetch(
                  `http://alb-pymetrack-gateway-1161738198.us-east-1.elb.amazonaws.com/api/v1/inventario/producto/${producto.id}`,
                  {
                    headers: {
                      Authorization: token ? `Bearer ${token}` : '',
                    },
                  }
                );

                if (!inventarioResponse.ok) {
                  return {
                    ...producto,
                    stockDisponible: 0,
                    stockReservado: 0,
                  };
                }

                const inventario = await inventarioResponse.json();

                return {
                  ...producto,
                  stockDisponible: inventario.stockDisponible ?? 0,
                  stockReservado: inventario.stockReservado ?? 0,
                };
              } catch {
                return {
                  ...producto,
                  stockDisponible: 0,
                  stockReservado: 0,
                };
              }
            })
        );
        setProductos(productosActivos);
      } catch (err) {
        console.error('❌ Error cargando productos:', err);
        setError('No fue posible cargar el catálogo de productos.');
      } finally {
        setLoadingProductos(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return productos;

    return productos.filter((producto) =>
      producto.nombreProducto.toLowerCase().includes(texto) ||
      producto.codigoSKU.toLowerCase().includes(texto) ||
      producto.categoriaProducto?.toLowerCase().includes(texto)
    );
  }, [productos, busqueda]);

  const subtotal = useMemo(() => {
    return productosSeleccionados.reduce((total, item) => {
      return total + item.producto.precioVentaChile * item.cantidad;
    }, 0);
  }, [productosSeleccionados]);

  const costoDespacho = Number(formData.costoDespachoChile || 0);
  const totalPedido = subtotal + costoDespacho;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarProducto = (producto: ProductoCatalogo) => {
    const stockDisponible = producto.stockDisponible ?? 0;

    if (stockDisponible <= 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }

    setProductosSeleccionados((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);

      if (existe) {
        if (existe.cantidad >= stockDisponible) {
          alert('No puedes agregar más unidades que el stock disponible.');
          return prev;
        }

        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      quitarProducto(productoId);
      return;
    }

    setProductosSeleccionados((prev) =>
      prev.map((item) => {
        if (item.producto.id !== productoId) {
          return item;
        }

        const stockDisponible = item.producto.stockDisponible ?? 0;

        if (cantidad > stockDisponible) {
          alert('No puedes superar el stock disponible.');
          return {
            ...item,
            cantidad: stockDisponible,
          };
        }

        return {
          ...item,
          cantidad,
        };
      })
    );
  };

  const quitarProducto = (productoId: number) => {
    setProductosSeleccionados((prev) =>
      prev.filter((item) => item.producto.id !== productoId)
    );
  };

  const generarNumeroOrden = () => {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);

    return `ORD-${yyyy}${mm}${dd}${hh}${min}-${random}`;
  };

  const generarEtiqueta = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `PYM-${Date.now()}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un producto.');
      return;
    }

    try {
      setLoading(true);

      const pymeId = obtenerPymeId();

      const resumenProductos = productosSeleccionados
        .map((item) => `${item.producto.nombreProducto} x${item.cantidad}`)
        .join(', ');

      const pedidoData = {
        idPyme: pymeId,
        numeroOrdenPyme: generarNumeroOrden(),
        nombreCliente: formData.nombreCliente,
        emailCliente: formData.emailCliente,
        telefonoCliente: formData.telefonoCliente,
        direccionEntregaChile: formData.direccionEntregaChile,
        comunaEntregaChile: formData.comunaEntregaChile,
        regionEntregaChile: formData.regionEntregaChile,
        estadoPedidoPyme: 'DISPONIBLE',
        subtotal,
        costoDespachoChile: costoDespacho,
        totalPedido,
        etiquetaDespachoPyme: generarEtiqueta(),
        notasPedido: [
          formData.notasPedido,
          `Productos: ${resumenProductos}`,
        ]
          .filter(Boolean)
          .join(' | '),
        items: productosSeleccionados.map((item) => ({
          productoId: item.producto.id,
          nombreProducto: item.producto.nombreProducto,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precioVentaChile,
        })),
      };

      console.log('📦 Creando pedido:', pedidoData);

      await apiClient.post('/pedidos', pedidoData);

      alert('✅ Pedido creado exitosamente');
      router.push('/pedidos');
    } catch (err: any) {
      console.error('❌ Error al crear pedido:', err);
      alert(err?.message || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Crear Pedido
          </h1>
          <p className="text-gray-600 mt-1">
            Selecciona productos del catálogo y registra los datos de entrega.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Datos del cliente
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombreCliente"
                  placeholder="Nombre del cliente"
                  value={formData.nombreCliente}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                />

                <input
                  type="email"
                  name="emailCliente"
                  placeholder="Correo del cliente"
                  value={formData.emailCliente}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                />

                <input
                  type="text"
                  name="telefonoCliente"
                  placeholder="Teléfono"
                  value={formData.telefonoCliente}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-4 py-3 md:col-span-2 text-gray-900 placeholder-gray-400"
                />
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dirección de entrega
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="direccionEntregaChile"
                  placeholder="Dirección"
                  value={formData.direccionEntregaChile}
                  onChange={handleChange}
                  required
                  className="border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="comunaEntregaChile"
                    placeholder="Comuna"
                    value={formData.comunaEntregaChile}
                    onChange={handleChange}
                    required
                    className="border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                  />

                  <input
                    type="text"
                    name="regionEntregaChile"
                    placeholder="Región"
                    value={formData.regionEntregaChile}
                    onChange={handleChange}
                    required
                    className="border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Catálogo de productos
                  </h2>
                  <p className="text-sm text-gray-500">
                    Agrega productos al pedido desde el catálogo de la PYME.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Buscar producto, SKU o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border rounded-lg px-4 py-3 w-full md:w-80 text-gray-900 placeholder-gray-400"
                  
                />
              </div>

              {loadingProductos ? (
                <div className="py-10 text-center text-gray-500">
                  Cargando productos...
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No se encontraron productos.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition bg-white"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {producto.nombreProducto}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {producto.codigoSKU} 
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {producto.descripcionProducto || 'Sin descripción'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-blue-700">
                            {formatCurrency(producto.precioVentaChile)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span
                          className={`px-2 py-1 rounded-full font-semibold ${
                            (producto.stockDisponible ?? 0) <= 0
                              ? 'bg-red-100 text-red-700'
                              : (producto.stockDisponible ?? 0) <= 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {(producto.stockDisponible ?? 0) <= 0
                            ? 'Sin stock'
                            : `Stock: ${producto.stockDisponible}`}
                        </span>

                        {(producto.stockReservado ?? 0) > 0 && (
                          <span className="text-xs text-yellow-700">
                            Reservado: {producto.stockReservado}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => agregarProducto(producto)}
                        className="mt-4 w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                      >
                        Agregar al pedido
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del pedido
              </h2>

              {productosSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  Aún no has seleccionado productos.
                </div>
              ) : (
                <div className="space-y-3">
                  {productosSeleccionados.map((item) => (
                    <div
                      key={item.producto.id}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.producto.nombreProducto}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.producto.precioVentaChile)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => quitarProducto(item.producto.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <label className="text-sm text-gray-600">
                          Cantidad
                        </label>

                        <input
                          type="number"
                          min={1}
                          value={item.cantidad}
                          onChange={(e) =>
                            cambiarCantidad(item.producto.id, Number(e.target.value))
                          }
                          className="w-20 border rounded-lg px-3 py-2 text-center text-gray-900 placeholder-gray-400"
                        />
                      </div>

                      <p className="text-right font-semibold mt-2">
                        {formatCurrency(item.producto.precioVentaChile * item.cantidad)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t mt-5 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Costo despacho
                  </label>
                  <input
                    type="number"
                    name="costoDespachoChile"
                    value={formData.costoDespachoChile}
                    onChange={handleChange}
                    min={0}
                    className="w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="flex justify-between text-lg border-t pt-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(totalPedido)}
                  </span>
                </div>
              </div>

              <textarea
                name="notasPedido"
                placeholder="Notas adicionales"
                value={formData.notasPedido}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-3 mt-5 text-gray-900 placeholder-gray-400"
              />

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || productosSeleccionados.length === 0}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear pedido'}
                </button>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </Layout>
  );
}