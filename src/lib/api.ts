import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PaginatedResponse, ApiError } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://18.210.17.166:8086/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('token');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error: any) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: any) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error: any) => {
        console.error('API Error:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('refreshToken');

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        const apiError: ApiError = {
          message:
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Error desconocido',
          status: error.response?.status || 500,
          details: error.response?.data?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }

  // AUTH
  async login(email: string, password: string): Promise<AxiosResponse<any>> {
    return this.client.post('/auth/login', { email, password });
  }

  async validateToken(token: string): Promise<AxiosResponse<any>> {
    return this.client.post(
      '/auth/validate',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  async changePassword(
    pymeId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<AxiosResponse<any>> {
    return this.client.post(`/auth/change-password/${pymeId}`, {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<any>> {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  // PEDIDOS
  async getPedidosByPyme(pymeId: number): Promise<AxiosResponse<any[]>> {
    return this.client.get(`/pedidos/pyme/${pymeId}`);
  }

  async getPedidos(
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<any>>> {
    return this.client.get('/pedidos', { params });
  }

  async getPedido(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/pedidos/${id}`);
  }

  async crearPedido(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/pedidos', data);
  }

  async actualizarPedido(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put(`/pedidos/${id}`, data);
  }

  async eliminarPedido(id: number): Promise<AxiosResponse<void>> {
    return this.client.delete(`/pedidos/${id}`);
  }

  // PRODUCTOS
  async getProductos(
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<any>>> {
    return this.client.get('/productos', { params });
  }

  async getProducto(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/productos/${id}`);
  }

  async crearProducto(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/productos', data);
  }

  async actualizarProducto(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put(`/productos/${id}`, data);
  }

  async eliminarProducto(id: number): Promise<AxiosResponse<void>> {
    return this.client.delete(`/productos/${id}`);
  }

  // INVENTARIO
  async getInventarioByProducto(productoId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/inventario/producto/${productoId}`);
  }

  async actualizarInventario(
    productoId: number,
    stockDisponible: number,
    stockReservado: number
  ): Promise<AxiosResponse<any>> {
    return this.client.put(`/inventario/producto/${productoId}/stock`, {
      stockDisponible,
      stockReservado,
    });
  }

  // PYMES
  async getPymes(
    params?: any
  ): Promise<AxiosResponse<PaginatedResponse<any>>> {
    return this.client.get('/pymes', { params });
  }

  async getPyme(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/pymes/${id}`);
  }

  async crearPyme(data: any): Promise<AxiosResponse<any>> {
    return this.client.post('/pymes', data);
  }

  async actualizarPyme(id: number, data: any): Promise<AxiosResponse<any>> {
    return this.client.put(`/pymes/${id}`, data);
  }

  async eliminarPyme(id: number): Promise<AxiosResponse<void>> {
    return this.client.delete(`/pymes/${id}`);
  }

  // BFF
  async getDashboard(pymeId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bff/dashboard/${pymeId}`);
  }

  async getEstadisticasPyme(pymeId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bff/pymes/${pymeId}/estadisticas`);
  }

  async getProductosEnriquecidos(
    pymeId: number,
    categoria?: string
  ): Promise<AxiosResponse<any>> {
    const params = categoria ? { categoria } : {};
    return this.client.get(`/bff/pymes/${pymeId}/productos`, { params });
  }

  async getPedidosEnriquecidos(
    pymeId: number,
    estado?: string
  ): Promise<AxiosResponse<any>> {
    const params = estado ? { estado } : {};
    return this.client.get(`/bff/pymes/${pymeId}/pedidos`, { params });
  }

  async getResumenPyme(pymeId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bff/pymes/${pymeId}/resumen`);
  }

  async getBffHealth(): Promise<AxiosResponse<any>> {
    return this.client.get('/bff/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;