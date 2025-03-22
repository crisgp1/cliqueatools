# Cliquéalo.mx Backend - Simulador de Créditos Automotrices

Este proyecto es el backend basado en microservicios para la simulación de créditos automotrices, siguiendo la arquitectura hexagonal y los principios de Domain-Driven Design.

## Estructura del Proyecto

- **Backend**: Arquitectura de microservicios
  - **auth-service**: Autenticación y gestión de usuarios
  - **client-service**: Gestión de datos de clientes
  - **vehicle-service**: Gestión de datos de vehículos
  - **bank-service**: Gestión de bancos e instituciones financieras
  - **credit-service**: Gestión de créditos y préstamos
  - **amortization-service**: Cálculos de amortización y pagos
  - **api-gateway**: Punto de entrada para todas las solicitudes del cliente
  - **shared**: Utilidades y modelos compartidos

## Comenzando

### Prerrequisitos

- Docker y Docker Compose
- Node.js (>= 16.x) y npm (>= 8.x) para desarrollo local

### Ejecutando con Docker

```bash
docker-compose up
```

### Desarrollo

Cada microservicio puede desarrollarse independientemente:

```bash
cd backend/[nombre-servicio]
npm install
npm run dev
```

## Arquitectura

Este proyecto sigue la arquitectura hexagonal (puertos y adaptadores) combinada con los principios de Domain-Driven Design, organizada en una arquitectura de microservicios.

### Capas de la Arquitectura Hexagonal:

1. **Capa de Dominio**: Lógica de negocio principal, entidades, objetos de valor
2. **Capa de Aplicación**: Casos de uso, servicios de aplicación, DTOs
3. **Capa de Infraestructura**: Integración con sistemas externos, persistencia
4. **Capa de Interfaz**: Controladores, presentadores, endpoints API

## Stack Tecnológico

- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL
- **Infraestructura**: Docker, Docker Compose
