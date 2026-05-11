# WorkFlow

> Registro diario de actividades laborales con soporte de imágenes, accesible desde cualquier dispositivo.

![WorkFlow](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase) ![Vercel](https://img.shields.io/badge/Vercel-deploy-000?logo=vercel)

---

## Descripción

WorkFlow es una aplicación web que permite registrar y consultar las actividades realizadas durante el día laboral. Cada actividad puede incluir título, descripción, hora automática e imágenes adjuntas. Los datos se almacenan en la nube y son accesibles desde cualquier máquina o dispositivo.

---

## Funcionalidades

- **Autenticación** — Login con email y contraseña mediante Supabase Auth
- **Registro de actividades** — Título, descripción y hora automática al guardar
- **Imágenes adjuntas** — Sube una o varias imágenes por actividad
- **Vista diaria** — Muestra solo las actividades del día actual
- **Historial** — Consulta todas las actividades anteriores agrupadas por día
- **Buscador en tiempo real** — Filtra actividades por título o descripción
- **Eliminar actividades** — Borra registros individuales
- **Acceso desde cualquier lugar** — Datos en la nube, sin dependencia del dispositivo local

---

## Stack tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| Frontend | React 18 + Vite | Interfaz de usuario |
| Autenticación | Supabase Auth | Login con email y contraseña |
| Base de datos | Supabase PostgreSQL | Almacenamiento de actividades |
| Almacenamiento | Supabase Storage | Imágenes adjuntas |
| Deploy | Vercel | Hosting gratuito con CI/CD automático |
| Íconos | Tabler Icons | Librería de íconos vía CDN |
| Contenedor dev | Docker + Docker Compose | Entorno de desarrollo sin instalar Node localmente |

---

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop) instalado
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [GitHub](https://github.com) (gratis)

> No es necesario tener Node.js instalado localmente. El entorno de desarrollo corre completamente dentro de Docker.

---

## Configuración de Supabase

### 1. Crear el proyecto

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Selecciona la región **South America (São Paulo)**
3. Guarda la contraseña de la base de datos

### 2. Crear la tabla de actividades

En **SQL Editor** ejecuta:

```sql
create table actividades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  descripcion text,
  fecha_hora timestamptz default now() not null,
  imagenes text[],
  created_at timestamptz default now()
);

alter table actividades enable row level security;

create policy "usuarios ven solo sus actividades"
  on actividades for all
  using (auth.uid() = user_id);
```

### 3. Crear el bucket de imágenes

1. Ve a **Storage → New bucket**
2. Nombre: `imagenes`
3. Activa **Public bucket**
4. En **Policies** agrega con la expresión:

```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

Marca las 4 operaciones: SELECT, INSERT, UPDATE, DELETE.

### 4. Crear tu usuario

Ve a **Authentication → Users → Add user** e ingresa tu email y contraseña.

### 5. Obtener credenciales

Ve a **Settings → API** y copia:
- **Project URL** → `VITE_SUPABASE_URL`
- **Publishable key** → `VITE_SUPABASE_ANON_KEY`

---

## Instalación y desarrollo local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/workflow-app.git
cd workflow-app
```

### 2. Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
```

### 3. Construir y levantar el contenedor

```bash
docker compose build
docker compose up
```

La app estará disponible en `http://localhost:5173`.

> Si accedes desde otra máquina en la red local, usa la IP del servidor: `http://192.168.1.X:5173`

### 4. Detener el contenedor

```bash
docker compose down
```

---

## Estructura del proyecto

```
workflow-app/
├── public/
├── src/
│   ├── components/         # Componentes reutilizables (futuro uso)
│   ├── lib/
│   │   └── supabase.js     # Cliente de Supabase
│   ├── pages/
│   │   ├── Login.jsx       # Pantalla de autenticación
│   │   └── Dashboard.jsx   # Vista principal con actividades
│   ├── App.jsx             # Enrutador y control de sesión
│   └── main.jsx            # Punto de entrada
├── .env                    # Variables de entorno (no subir a Git)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── index.html
├── package.json
└── vite.config.js
```

---

## Deploy en Vercel

El deploy es automático cada vez que haces `git push` a la rama `main`.

### Primera vez

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Haz clic en **Add New Project** y selecciona `workflow-app`
3. En **Environment Variables** agrega:

```
VITE_SUPABASE_URL       = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY  = sb_publishable_xxxxxxxxxxxx
```

4. Haz clic en **Deploy**

### Actualizaciones

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push y redespliega automáticamente en 1-2 minutos.

---

## Variables de entorno

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Llave pública de Supabase | Settings → API → Publishable key |

> **Nunca subas el archivo `.env` a GitHub.** Está incluido en `.gitignore`.

---

## Uso de la aplicación

### Iniciar sesión
Ingresa con el email y contraseña creados en Supabase Authentication.

### Registrar una actividad
1. Escribe el título de la actividad
2. Agrega una descripción opcional
3. Adjunta imágenes si es necesario (clic en el área de upload)
4. Haz clic en **Guardar actividad**

### Buscar actividades
Usa la barra de búsqueda para filtrar por título o descripción en tiempo real.

### Ver historial
Haz clic en la pestaña **Historial** para ver todas las actividades anteriores agrupadas por día.

### Eliminar una actividad
Haz clic en el ícono de basurero en la actividad que deseas eliminar.

---

## Seguridad

- Las contraseñas son manejadas completamente por Supabase Auth (nunca se almacenan en texto plano)
- Row Level Security (RLS) activado: cada usuario solo puede ver y modificar sus propias actividades
- Las variables de entorno nunca se exponen en el repositorio
- La llave `service_role` de Supabase nunca se usa en el frontend

---

## Roadmap

- [ ] Editar actividades existentes
- [ ] Exportar actividades a PDF
- [ ] Filtrar por rango de fechas
- [ ] Notificaciones de recordatorio
- [ ] Modo oscuro

---

## Licencia

MIT © 2026