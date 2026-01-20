
# Guía de Configuración: Google Auth + Firebase 🔐

Para que el botón "Login con Google" funcione realmente en tu dominio `goberanance.lobueno.co`, debes seguir estos 3 pasos en la Consola de Firebase.

## Paso 1: Configurar Dominios Autorizados

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Selecciona tu proyecto.
3.  En el menú lateral, ve a **Authentication** -> pestaña **Settings** (Configuración) -> pestaña **Authorized domains** (Dominios autorizados).
4.  Haz clic en **Add domain**.
5.  Agrega los siguientes dominios:
    *   `goberanance.lobueno.co`
    *   `18.221.232.106` (Tu IP, importante para probar antes de que el DNS propague).

## Paso 2: Crear App Web en Firebase

1.  Ve a **Project Overview** (el icono de engranaje ⚙️ -> Project settings).
2.  En la sección "Your apps", haz clic en el icono web `</>`.
3.  Ponle un nombre (ej. "Governance Prod") y registra la app.
4.  Te mostrará un código con `const firebaseConfig = { ... }`.
5.  **COPIA ESOS VALORES**.

## Paso 3: Configurar Servidor (EC2)

Necesitas poner esos valores en el archivo `.env` dentro de tu servidor. Conéctate y ejecútalo:

```bash
# 1. Conectar al servidor
ssh -i gobernance.pem ubuntu@18.221.232.106

# 2. Ir a la carpeta
cd gobernance_app

# 3. Crear/Editar el archivo .env
nano .env
```

Pega el siguiente contenido (reemplazando con TUS valores del Paso 2):

```ini
VITE_FIREBASE_API_KEY=AIzaSyB... (tu api key)
VITE_FIREBASE_AUTH_DOMAIN=tuproyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tuproyecto
VITE_FIREBASE_STORAGE_BUCKET=tuproyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456...
VITE_FIREBASE_APP_ID=1:12345:web:abcdef...
```

Guarda (`Ctrl+O`, `Enter`) y sal (`Ctrl+X`).

## Paso 4: Reconstruir

Una vez guardado el archivo `.env` en el servidor, ejecuta:

```bash
# Reconstruye la imagen para que tome las nuevas variables
sudo docker build -t governance-builder .

# Reinicia el contenedor
sudo docker stop app
sudo docker rm app
sudo docker run -d -p 80:80 --name app governance-builder
```

¡Listo! Ahora el login funcionará con usuarios reales.
