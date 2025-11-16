# FixItNow - Frontend

Frontend de la aplicación FixItNow, una plataforma para conectar proveedores de servicios con consumidores.

## Tecnologías Utilizadas

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: Shadcn/ui
- **Gestión de Estado**: React Context API
- **Fetching de Datos**: SWR
- **Formularios**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Notificaciones**: Sonner
- **Fechas**: date-fns

## Requisitos Previos

- Node.js >= 20.9.0 (recomendado, funciona con 18.x con warnings)
- npm >= 10.x
- Backend de FixItNow corriendo en http://localhost:3000

## Instalación

1. Las dependencias ya están instaladas

2. Verifica las variables de entorno en .env.local:
   NEXT_PUBLIC_API_URL=http://localhost:3000

## Ejecución en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en http://localhost:3001

## Funcionalidades Implementadas

### Público
- ✅ Landing page
- ✅ Registro (PROVIDER/CONSUMER)
- ✅ Login

### Consumidores (CONSUMER)
- ✅ Dashboard con resumen
- ✅ Explorar servicios con búsqueda
- ✅ Ver detalles de servicios

### Proveedores (PROVIDER)
- ✅ Dashboard con estadísticas
- ✅ Crear servicios
- ✅ Listar y gestionar servicios
- ✅ Activar/Desactivar servicios
- ✅ Eliminar servicios

## Rutas Principales

- `/` - Landing page
- `/auth/login` - Inicio de sesión
- `/auth/register` - Registro
- `/consumer/dashboard` - Dashboard consumidor
- `/consumer/services` - Explorar servicios
- `/provider/dashboard` - Dashboard proveedor
- `/provider/services` - Gestionar servicios
- `/provider/services/new` - Crear servicio

## Autenticación

Sistema de autenticación con JWT almacenado en localStorage.
Las rutas están protegidas por rol (CONSUMER/PROVIDER).

## Scripts

\`\`\`bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm start        # Ejecutar build
npm run lint     # Linter
\`\`\`

## Docker

### Ejecutar solo el Frontend con Docker

\`\`\`bash
# Construir la imagen
docker build -t fixitnow-frontend .

# Ejecutar el contenedor
docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 fixitnow-frontend
\`\`\`

### Ejecutar Frontend + Backend + PostgreSQL con Docker Compose

Desde la raíz del proyecto (un nivel arriba):

\`\`\`bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
\`\`\`

**Servicios disponibles:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

### Notas sobre Docker

1. **Variables de entorno**: El archivo \`.env.production\` contiene las variables para producción
2. **Modo standalone**: Next.js está configurado con \`output: 'standalone'\` para optimizar el contenedor
3. **Multi-stage build**: El Dockerfile usa múltiples etapas para reducir el tamaño de la imagen final
4. **Usuario no-root**: El contenedor ejecuta como usuario \`nextjs\` por seguridad

## Contacto

Proyecto educacional - FixItNow © 2024
