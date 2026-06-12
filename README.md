# ⚙️ Módulo de Administración Centralizada - PymeTrack

Este directorio contiene la refactorización y purga completa del flujo administrativo del sistema. Se aislaron las vistas del administrador del antiguo entorno de las PYMEs, redirigiendo todo el consumo hacia el **Gateway Administrativo Independiente**.

## 🚀 Cambios e Implementaciones Realizadas

### 1. Autenticación y Sesión (`/loginAdmin`)

- **Aislamiento de Rutas:** Se creó la vista exclusiva de acceso en `src/app/loginAdmin/page.tsx`.
- **Sincronización de Estado:** Configurado para almacenar las llaves `adminToken` y `adminUser` requeridas por los tableros.
- **Mejora de UX (Interface):** Se añadió un visor dinámico de contraseña interactivo (icono del ojito) para ocultar/mostrar la clave.

### 2. Tableros de Control (`/admin/*`)

Se independizó el diseño visual implementando un menú lateral vertical corporativo (`bg-blue-950`) en cada vista, eliminando dependencias con los layouts viejos de productos:

- **Monitoreo Global (`/admin/monitoreo`):** Consume estadísticas reales e interactúa con el puerto administrativo.
- **Control de PYMEs (`/admin/pymes`):** Tabla de gestión operativa para activar o suspender empresas registradas mediante peticiones directas.
- **Repartidores (`/admin/repartidores`):** Mapeo seguro de conductores logísticos sincronizados por Axios.
- **Cierre de Sesión:** Botón unificado en el menú lateral que limpia el `localStorage` y redirige de forma segura a `/loginAdmin`.

### 3. Seguridad de Rutas (`middleware.ts`)

- Se reescribió el guardia de seguridad (`middleware`) para interceptar peticiones entrantes.
- Si el usuario no tiene token, es redirigido obligatoriamente a `/loginAdmin` (evitando errores 404).
- Si el usuario ya está logueado, se bloquea el acceso al login y se le mantiene dentro de `/admin/monitoreo` para evitar bucles infinitos.

## 📡 Infraestructura de Conexión

- **Cliente de API:** `apiAdmin` (Configurado exclusivamente para interactuar en el **Puerto 8086**).
- **Spring Boot Gateway:** Asegúrate de tener levantado el microservicio administrativo local en dicho puerto antes de levantar este frontend.

## 🛠️ Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Levantar entorno de desarrollo local
npm run dev

# Compilar para producción (Validación de tipos de TypeScript)
npm run build
```
