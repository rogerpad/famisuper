# Famisuper - Sistema de Cierre de Super

Aplicación web para gestión y cierre de transacciones desarrollada con Nest.js (backend), React.js (frontend), TypeScript y PostgreSQL.

## Estructura del Proyecto

El proyecto está organizado en una arquitectura de monorepo con las siguientes carpetas principales:

- `backend/`: API REST desarrollada con Nest.js y TypeScript
- `frontend/`: Aplicación SPA desarrollada con React.js y TypeScript
- `docker/`: Configuración de Docker para desarrollo y producción

## Requisitos

- Node.js (v16 o superior)
- npm o yarn
- PostgreSQL
- Docker (opcional, para desarrollo con contenedores)

## Instalación

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Desarrollo con Docker

```bash
docker-compose -f docker/docker-compose.yml up
```

## Características Principales

- Autenticación y autorización de usuarios
- Gestión de transacciones
- Cierre de transacciones
- Generación de reportes
- Panel de administración
