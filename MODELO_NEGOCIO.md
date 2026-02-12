# 📊 Governance Builder - Modelo de Negocio y Caso de Uso

Este documento describe la propuesta de valor, estructura comercial y un caso de uso típico de la plataforma **Governance Builder**.

---

## 1. Modelo de Negocio (Business Model Canvas Adaptado)

### 💎 Propuesta de Valor
*   **Estandarización y Gobernanza:** Centraliza y estandariza la nomenclatura de campañas publicitarias para evitar errores humanos y discrepancias de datos.
*   **Colaboración en Tiempo Real:** Permite que múltiples equipos (Planning, Tráfico, Data) trabajen sobre una "única fuente de verdad" sincronizada en la nube.
*   **Eficiencia Operativa:** Reduce el tiempo dedicado a la creación manual de nombres y la corrección de errores de tracking.
*   **Independencia del Cliente:** Configuración aislada por cliente (Tenant/Client), permitiendo reglas de negocio personalizadas para cada marca.
*   **Seguridad:** Acceso gestionado mediante SSO corporativo (Google).

### 👥 Segmentos de Clientes
*   **Agencias de Publicidad (Medios/Creativas):** Que gestionan múltiples clientes y necesitan estandarizar procesos internos.
*   **Anunciantes In-House:** Grandes marcas que gestionan su propia compra de medios y requieren consistencia en sus datos.
*   **Consultoras de Data:** Que implementan estructuras de medición para terceros.

### 📢 Canales
*   **Plataforma Web (SaaS):** Acceso directo a través del navegador.
*   **Integración API (Futuro):** Posible conexión directa con DSPs/AdServers (Meta, DV360).

### ❤️ Relación con Clientes
*   **Autoservicio (Self-Service):** Los Admins configuran sus propios entornos.
*   **Soporte Técnico (IT Interno):** Para gestión de accesos y resolución de incidencias.

### 💰 Fuentes de Ingresos
*   **Licenciamiento SaaS:** Cobro mensual/anual por Organización (Tenant) o por volumen de Clientes activos.
*   **Servicios de Implementación:** Consultoría para definir las taxonomías iniciales.

### 🔑 Recursos Clave
*   **Infraestructura Cloud:** Base de datos NoSQL (Firestore) para flexibilidad y escala.
*   **Lógica de Negocio (Frontend):** Aplicación React robusta para la construcción dinámica de nombres.
*   **Sistema de Autenticación:** Google Identity Platform.

### 🏗️ Actividades Clave
*   **Desarrollo de Producto:** Mantenimiento y mejora continua de la plataforma.
*   **Gestión de Diccionarios:** Actualización constante de valores (nuevos países, nuevos objetivos).
*   **Soporte a Usuarios:** Onboarding de nuevos equipos.

### 🤝 Socios Clave
*   **Google Cloud Platform:** Proveedor de infraestructura.
*   **Dpto. de IT:** Para la integración con sistemas corporativos.

### 📉 Estructura de Costos
*   **Infraestructura Cloud:** Costos de computación, almacenamiento y ancho de banda (Firebase/AWS).
*   **Desarrollo y Mantenimiento:** Equipo de ingeniería.

---

## 2. Caso de Uso: Creación de Campaña Estándar

**Título:** Generación de Nomenclature para Campaña "Black Friday 2024"

**Actores:**
*   **Planner (Ana):** Responsable de definir la estrategia.
*   **Trafficker (Luis):** Responsable de implementar la campaña en plataformas.

**Precondiciones:**
*   Ana y Luis tienen cuentas activas y acceso a la organización "Agencia Global".
*   El cliente "Retail X" está configurado en la herramienta.

**Flujo Principal:**

1.  **Inicio de Sesión:** Ana ingresa a Governance Builder y se autentica con Google.
2.  **Selección de Contexto:** Ana selecciona la Organización "Agencia Global" y el Cliente "Retail X".
3.  **Configuración (Opcional):** Ana nota que falta el objetivo "Venta Flash" en el diccionario. Como tiene rol de *Planner*, va a la pestaña "Configuration", agrega "Venta Flash" en la categoría "Objetivo" y guarda. El cambio se sincroniza instantáneamente.
4.  **Construcción del Nombre:**
    *   Ana va a la pestaña "Builder".
    *   En el nivel **Campaign**, selecciona:
        *   País: `COL`
        *   Año: `2024`
        *   Marca: `RetailX`
        *   Objetivo: `VentaFlash` (recién creado)
    *   La herramienta genera automáticamente: `COL_2024_RetailX_VentaFlash`.
5.  **Guardado:** Ana hace clic en "Save to Cloud". El nombre se guarda en el historial de "Retail X".
6.  **Consumo:**
    *   Luis (Trafficker) entra más tarde a la herramienta.
    *   Va al historial, filtra por "Retail X".
    *   Encuentra la nomenclatura creada por Ana.
    *   Copia el string `COL_2024_RetailX_VentaFlash`.
    *   Lo pega en Meta Ads Manager para nombrar su campaña.

**Postcondiciones:**
*   La campaña en Meta Ads tiene el nombre correcto y estandarizado.
*   El registro queda en Governance Builder para auditoría futura.
*   Los datos de rendimiento podrán cruzarse fácilmente gracias a la nomenclatura consistente.
