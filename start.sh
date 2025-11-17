#!/bin/bash

# FixItNow Frontend - Script de inicio simple
# Este script inicia el frontend en modo desarrollo LOCAL (sin Docker)

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  FixItNow Frontend - Inicio${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encuentra package.json${NC}"
    echo -e "${RED}Ejecuta este script desde el directorio frontend${NC}"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}⚠️  ERROR: Versión de Node.js incompatible${NC}"
    echo ""
    echo -e "${YELLOW}Versión actual:${NC} $(node -v)"
    echo -e "${YELLOW}Versión requerida:${NC} >= 20.9.0"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  SOLUCIONES:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Opción 1: Actualizar Node.js (Recomendado)${NC}"
    echo ""
    echo "  Con Homebrew:"
    echo "    brew update"
    echo "    brew upgrade node"
    echo ""
    echo "  O descarga desde: https://nodejs.org/"
    echo "    - Descarga la versión LTS (20.x o superior)"
    echo "    - Instala el paquete .pkg"
    echo "    - Reinicia la terminal"
    echo ""
    echo -e "${GREEN}Opción 2: Usar nvm (Node Version Manager)${NC}"
    echo ""
    echo "  Instalar nvm:"
    echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    echo "  Instalar Node 20:"
    echo "    nvm install 20"
    echo "    nvm use 20"
    echo "    nvm alias default 20"
    echo ""
    echo -e "${GREEN}Opción 3: Downgrade temporal de Next.js${NC}"
    echo ""
    echo "  Usar Next.js 14 (compatible con Node 18):"
    echo "    npm install next@14 react@18 react-dom@18"
    echo ""
    echo -e "${YELLOW}Después de actualizar Node.js, ejecuta este script nuevamente.${NC}"
    echo ""
    exit 1
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[1/2]${NC} Instalando dependencias..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencias instaladas"
else
    echo -e "${YELLOW}[1/2]${NC} Dependencias ya instaladas"
fi

# Verificar que el backend esté corriendo
echo ""
echo -e "${YELLOW}[2/2]${NC} Verificando backend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend está corriendo en http://localhost:3000"
else
    echo -e "${YELLOW}⚠${NC} Backend no está corriendo"
    echo -e "${YELLOW}   Asegúrate de iniciar el backend primero:${NC}"
    echo -e "${YELLOW}   cd backend && ./start.sh${NC}"
    echo ""
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Iniciando servidor de desarrollo${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Backend API:${NC} http://localhost:3000 (configurado en .env.local)"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener${NC}"
echo ""

# Iniciar servidor
npm run dev
