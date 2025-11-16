#!/bin/bash

# Script helper para Frontend FixItNow
# Uso: ./frontend.sh [comando]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de ayuda
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Mostrar uso
show_usage() {
    cat << EOF
FixItNow Frontend - Helper Script

Uso: ./frontend.sh [comando]

Comandos disponibles:

  Docker:
    up              Levantar solo frontend
    down            Detener frontend
    build           Reconstruir imagen del frontend
    rebuild         Detener, reconstruir y levantar
    logs            Ver logs del frontend
    restart         Reiniciar frontend
    shell           Abrir shell en contenedor frontend

  Desarrollo Local (sin Docker):
    dev             Iniciar en modo desarrollo (hot reload)
    build-local     Compilar aplicación para producción
    start           Iniciar aplicación en modo producción
    lint            Ejecutar linter
    format          Formatear código

  Next.js:
    analyze         Analizar bundle size
    clean           Limpiar archivos compilados (.next)
    export          Exportar sitio estático
    typecheck       Verificar tipos de TypeScript

  Utilidades:
    install         Instalar dependencias
    update          Actualizar dependencias
    outdated        Ver dependencias desactualizadas

  Información:
    help            Mostrar esta ayuda
    status          Ver estado del frontend
    ps              Ver contenedores relacionados

EOF
}

# Comandos Docker
cmd_up() {
    print_info "Levantando frontend..."
    docker-compose up -d frontend
    print_success "Frontend iniciado"
    print_info "Frontend: http://localhost:3001"
}

cmd_down() {
    print_info "Deteniendo frontend..."
    docker-compose stop frontend
    print_success "Frontend detenido"
}

cmd_build() {
    print_info "Reconstruyendo imagen del frontend..."
    docker-compose build --no-cache frontend
    print_success "Imagen reconstruida"
}

cmd_rebuild() {
    print_info "Rebuild completo: stop -> build -> up..."
    docker-compose stop frontend
    docker-compose build --no-cache frontend
    docker-compose up -d frontend
    print_success "Frontend reconstruido y levantado"
}

cmd_logs() {
    docker-compose logs -f frontend
}

cmd_restart() {
    print_info "Reiniciando frontend..."
    docker-compose restart frontend
    print_success "Frontend reiniciado"
}

cmd_shell() {
    print_info "Abriendo shell en frontend..."
    docker-compose exec frontend sh
}

# Desarrollo Local (sin Docker)
cmd_dev() {
    print_info "Iniciando frontend en modo desarrollo..."
    print_info "Frontend estará disponible en http://localhost:3000"
    npm run dev
}

cmd_build_local() {
    print_info "Compilando aplicación para producción..."
    npm run build
    print_success "Build completado"
}

cmd_start() {
    print_info "Iniciando aplicación en modo producción..."
    print_info "Asegúrate de haber ejecutado 'build-local' primero"
    npm run start
}

cmd_lint() {
    print_info "Ejecutando linter..."
    npm run lint
}

cmd_format() {
    print_info "Formateando código..."
    npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"
    print_success "Código formateado"
}

# Next.js
cmd_analyze() {
    print_info "Analizando tamaño del bundle..."
    if [ ! -f "package.json" ] || ! grep -q "@next/bundle-analyzer" package.json; then
        print_error "Bundle analyzer no está instalado"
        print_info "Instala con: npm install --save-dev @next/bundle-analyzer"
        exit 1
    fi
    ANALYZE=true npm run build
}

cmd_clean() {
    print_info "Limpiando archivos compilados..."
    rm -rf .next
    rm -rf out
    print_success "Limpieza completada"
}

cmd_export() {
    print_info "Exportando sitio estático..."
    npm run build
    print_success "Exportación completada"
    print_info "Archivos en: .next/"
}

cmd_typecheck() {
    print_info "Verificando tipos de TypeScript..."
    npx tsc --noEmit
    print_success "Verificación de tipos completada"
}

# Utilidades
cmd_install() {
    print_info "Instalando dependencias..."
    npm install
    print_success "Dependencias instaladas"
}

cmd_update() {
    print_info "Actualizando dependencias..."
    npm update
    print_success "Dependencias actualizadas"
}

cmd_outdated() {
    print_info "Verificando dependencias desactualizadas..."
    npm outdated
}

# Información
cmd_status() {
    print_header "Estado del Frontend"
    echo ""
    echo "Contenedor:"
    docker-compose ps frontend 2>/dev/null || echo "No está corriendo en Docker"
    echo ""
    echo "Información del proyecto:"
    if [ -f "package.json" ]; then
        echo "  Nombre: $(node -p "require('./package.json').name")"
        echo "  Versión: $(node -p "require('./package.json').version")"
        echo "  Next.js: $(node -p "require('./package.json').dependencies.next")"
        echo "  React: $(node -p "require('./package.json').dependencies.react")"
    fi
    echo ""
    echo "Archivos compilados:"
    if [ -d ".next" ]; then
        print_success ".next/ existe"
    else
        print_error ".next/ no existe (ejecuta build-local)"
    fi
}

cmd_ps() {
    docker-compose ps
}

# Main
case "$1" in
    # Docker
    up) cmd_up ;;
    down) cmd_down ;;
    build) cmd_build ;;
    rebuild) cmd_rebuild ;;
    logs) cmd_logs ;;
    restart) cmd_restart ;;
    shell) cmd_shell ;;

    # Local Dev
    dev) cmd_dev ;;
    build-local) cmd_build_local ;;
    start) cmd_start ;;
    lint) cmd_lint ;;
    format) cmd_format ;;

    # Next.js
    analyze) cmd_analyze ;;
    clean) cmd_clean ;;
    export) cmd_export ;;
    typecheck) cmd_typecheck ;;

    # Utilities
    install) cmd_install ;;
    update) cmd_update ;;
    outdated) cmd_outdated ;;

    # Info
    status) cmd_status ;;
    ps) cmd_ps ;;
    help|--help|-h) show_usage ;;

    *)
        print_error "Comando desconocido: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
