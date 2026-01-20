# Plan de Migración: Arquitectura AWS Nativa (PostgreSQL)

## 1. ¿Por qué migrar? (Recomendación)

Recomiendo encarecidamente esta migración por 3 razones clave para una aplicación de "Gobierno de Datos":

1.  **Integridad de Datos**: La relación `Tenant -> Client -> Taxonomy` es estrictamente relacional. SQL (Postgres) asegura que no haya datos "huérfanos" y permite consultas complejas que Firebase dificulta.
2.  **Control Total**: Al tener tu propia API (Node.js) y Base de Datos en tu EC2, eliminamos la incertidumbre de la "sincronización mágica" de Firebase. Si algo falla, el servidor nos dirá exactamente por qué.
3.  **Independencia**: Eliminas la dependencia de la plataforma de Google y las reglas de seguridad de su consola. Todo el código y los datos viven en tu servidor.

---

## 2. Nueva Arquitectura

Sustituiremos el SDK de Firebase por una API REST ligera y una Base de Datos Real.

*   **Frontend**: React (Vite) - *Ya existe*.
*   **Backend**: Node.js + Express (Nuevo contenedor).
*   **Base de Datos**: PostgreSQL 16 (Nuevo contenedor).
*   **Proxy**: Nginx (Ya existe, actuará como puerta de enlace).

### Diagrama de Flujo
Usuarios -> [ Nginx (Puerto 443) ] -> /api -> [ Server Express ] -> [ PostgreSQL ]
                                    -> /    -> [ React Static ]

---

## 3. Pasos de Implementación

### Fase A: Preparación del Backend (Local)
1.  Crear carpeta `server/` dentro del proyecto.
2.  Inicializar proyecto Node (`npm init`).
3.  Instalar dependencias: `express`, `pg` (driver postgres), `cors`, `dotenv`.
4.  Crear estructura de base de datos (Schema):
    *   Tabla `tenants`
    *   Tabla `clients`
    *   Tabla `taxonomies` (Usando columna JSONB para los valores dinámicos).

### Fase B: Configuración de Docker
1.  Crear `docker-compose.yml` para orquestar los 3 servicios:
    *   `app`: El frontend (Nginx).
    *   `api`: El nuevo backend.
    *   `db`: PostgreSQL.
2.  Configurar volúmenes para que los datos de la BD persistan tras reinicios.

### Fase C: Refactorización del Frontend
1.  Modificar `services/taxonomyService.ts`.
2.  Reemplazar las llamadas a `addDoc/getDocs` (Firebase) por `fetch('/api/tenants')`, etc.
3.  Apuntar la autenticación a un sistema simple o mantener Firebase Auth solo para el login (Híbrido).
    *   *Recomendación*: Mantener Firebase Auth solo para el "Sign In" inicial por facilidad, pero guardar los datos de usuario en nuestra Postgres.

### Fase D: Despliegue
1.  Subir cambios al repo.
2.  En el servidor: `git pull` y `docker compose up -d --build`.

---

## 4. Tiempo Estimado
*   **Setup Backend**: 30-45 mins.
*   **Conexión Frontend**: 30 mins.
*   **Despliegue y Pruebas**: 20 mins.

**Total**: ~1.5 - 2 horas para tener una versión funcional y robusta.
