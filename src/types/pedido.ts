// Tipos TypeScript para la entidad Pedido
// Basado en la clase Java Pedido del backend

export enum EstadoPedidoPyme {
  PENDIENTE_CHILE = 'PENDIENTE_CHILE',
  CONFIRMADO_CHILE = 'CONFIRMADO_CHILE',
  PREPARACION_CHILE = 'PREPARACION_CHILE',
  CANCELADO_CHILE = 'CANCELADO_CHILE'
}

// Usar referencia de tipo para evitar dependencia circular
type PymeRef = import('./pyme').Pyme;

export interface Pedido {
  id: number;
  pyme: PymeRef;
  numeroOrdenPyme: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  direccionEntregaChile: string;
  comunaEntregaChile: string;
  regionEntregaChile: string;
  estadoPedidoPyme: EstadoPedidoPyme;
  subtotal: number; // BigDecimal convertido a number
  costoDespachoChile: number;
  totalPedido: number;
  etiquetaDespachoPyme?: string;
  notasPedido?: string;
  creadoEn: string; // LocalDateTime convertido a string ISO
  actualizadoEn?: string;
}

// Para creación de nuevos pedidos (sin campos generados automáticamente)
export interface CrearPedidoRequest {
  pymeId: number;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  direccionEntrega: string;
  comunaEntrega: string;
  regionEntrega: string;
  subtotal: number;
  costoEnvio?: number;
  detalles: DetallePedidoRequest[];
  notas?: string;
}

export interface DetallePedidoRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

// Para actualización de pedidos
export interface ActualizarPedidoRequest {
  nombreCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;
  direccionEntregaChile?: string;
  comunaEntregaChile?: string;
  regionEntregaChile?: string;
  estadoPedidoPyme?: EstadoPedidoPyme;
  subtotal?: number;
  costoDespachoChile?: number;
  totalPedido?: number;
  notasPedido?: string;
}

// Para respuestas de API
export interface PedidoResponse {
  data: Pedido[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Referencia a Pyme para evitar dependencia circular
// Se importará desde el index.ts
