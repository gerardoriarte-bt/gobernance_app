# 📘 Manual de Usuario: Governance Builder

Bienvenido a **Governance Builder**, la plataforma centralizada para la estandarización, creación y gestión de nomenclaturas publicitarias (Taxonomías). Esta herramienta asegura que todos los equipos (Planning, Tráfico, Data) hablen el mismo idioma, facilitando el seguimiento y análisis de campañas.

---

## 1. Conceptos Básicos

Antes de empezar, es importante entender la jerarquía de la herramienta:

1.  **Organización (Tenant)**: Es el nivel más alto (ej. "Agencia Buentipo"). Agrupa a múltiples clientes.
2.  **Cliente (Client)**: Es la marca específica para la que trabajas (ej. "Cliente A", "Cliente B").
    *   *Nota Importante*: Cada Cliente tiene su propia **Configuración Independiente**. Los diccionarios y reglas de un cliente no afectan a otros.
3.  **Taxonomía**: Es la estructura de nombre generada (ej. `Pais|Marca|Campaña|Objetivo`).

---

## 2. Acceso y Roles

El acceso se realiza mediante **Google Sign-In** con tu correo corporativo. Dependiendo de tu perfil, tendrás diferentes permisos:

*   **👑 Admin**: Control total. Puede crear Organizaciones, Clientes y modificar Diccionarios.
*   **📅 Planner**: Puede definir estructuras y valores en los diccionarios.
*   **🚀 Trafficker**: Usuario final. Utiliza las estructuras ya definidas para generar nombres y puede **Guardar** las nomenclaturas en el repositorio (Governance Check-out), aunque no puede alterar la configuración de los diccionarios.

---

## 3. Flujo de Trabajo (Paso a Paso)

### Paso 1: Selección del Entorno
Al ingresar, verás el **Dashboard**. Lo primero es seleccionar en el menú lateral:
1.  La **Organización** activa.
2.  El **Cliente** con el que vas a trabajar.

> 💡 **Tip**: Si es un cliente nuevo, deberás configurarlo primero (ver Sección 4). Si ya existe, la herramienta cargará automáticamente sus reglas.

### Paso 2: Generación de Nombres (El Constructor)
En la sección central verás tres columnas correspondientes a los niveles de las plataformas publicitarias:

1.  **🏷️ Campaign (Campaña)**: Define el nombre general. Selecciona País, Año, Marca, Objetivo, etc.
2.  **📂 Ad Set (Conjunto de Anuncios)**: Hereda datos de la campaña y añade detalles como Audiencia, Segmentación, Formato.
3.  **🎨 Ad (Anuncio)**: Detalles creativos como Dimensión, Versión, Copy.

**Acciones:**
*   **Seleccionar**: Elige valores de los menús desplegables estandarizados.
*   **Escribir**: Algunos campos permiten texto libre (Free Text) si se ha configurado así.
*   **Previsualizar**: En la parte inferior verás en tiempo real cómo queda el nombre (ej. `COL_2024_BrandAwareness`).

### Paso 3: Guardar y Exportar
Una vez completados los campos obligatorios:
1.  Haz clic en **"Save to Cloud"** (Guardar en la Nube).
2.  Esto guardará el registro en el historial y te permitirá copiar los nombres generados al portapapeles para pegarlos en Meta/Google/DV360.

---

## 4. Gestión de Configuración (Diccionarios)

> ⚠️ *Solo para Admins y Planners*

Para garantizar la calidad de los datos, los valores no se escriben manualmente cada vez, se seleccionan de "Diccionarios".

### ¿Cómo editar un Diccionario?
1.  Selecciona el Cliente.
2.  En el panel derecho "Configuration", verás las categorías disponibles (ej. *País, Objetivo, Canal*).
3.  **Añadir Opción**: Escribe el nuevo valor y pulsa `+`.
4.  **Nueva Categoría**: Si necesitas un campo nuevo (ej. "Temporada"), créalo desde "Add Category".
5.  **Asignar a Estructura**: Para que una categoría aparezca en el constructor, debes marcar si pertenece a *Campaign*, *AdSet* o *Ad*.

**La persistencia es automática**: Al hacer un cambio, este se guarda en la nube inmediatamente para ese cliente. Todos los usuarios que entren verán las nuevas opciones al instante.

---

## 5. Historial (Naming Repository)

En la parte inferior de la pantalla encontrarás el **Repositorio de Nombres**:

*   **Filtro "Current Selection"**: Muestra solo los nombres generados para el Cliente que estás viendo ahora.
*   **Filtro "All Records"**: Muestra el historial global de toda la organización.
*   **Editar**: Si te equivocaste en un nombre guardado, pulsa "Edit". Esto cargará los datos de nuevo en el constructor para que hagas correcciones y guardes una nueva versión.

---

## 6. Solución de Problemas Comunes

*   **"No veo mis clientes"**: Asegúrate de haber seleccionado primero la Organización correcta en la barra lateral izquierda.
*   **"No me deja escribir"**: Probablemente el campo sea de tipo "Selección Cerrada". Si necesitas un valor nuevo, contacta a un Admin para que lo agregue al diccionario.
*   **"Demo Mode"**: Si ves este aviso, contacta a Soporte Técnico (IT), indica que faltan las credenciales de conexión.

---

*Governance Builder v1.0 - Desarrollado por Tecnología Buentipo*
