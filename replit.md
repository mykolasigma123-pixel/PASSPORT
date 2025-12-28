# Passport Management System

## Overview

A full-stack web application for secure passport document management with group organization, QR code generation, and administrative controls. The system is designed as a minimalistic admin interface with Russian language as the default, featuring hierarchical admin roles, document expiration tracking, and public passport viewing via QR codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following Linear/Vercel-inspired minimal aesthetic
- **Form Handling**: React Hook Form with Zod validation (shared schemas with backend)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth via OpenID Connect (passport.js strategy)
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **File Uploads**: Multer for photo uploads stored in local filesystem
- **Scheduled Tasks**: node-cron for expiration date monitoring

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend for type consistency
- **Migrations**: Drizzle Kit for schema pushes (`npm run db:push`)

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory provide type safety across client and server
- **Storage Interface**: Abstract storage layer (`server/storage.ts`) encapsulates all database operations
- **API Structure**: RESTful endpoints under `/api/` prefix with JSON responses
- **Public Routes**: Unauthenticated access to passport viewing via `/p/:publicId` path

### Data Model
- **Users**: Admin accounts with main/sub-admin hierarchy and active/inactive status
- **Groups**: Organizational units for categorizing people
- **People (Passports)**: Document records with photos, QR codes, expiration tracking
- **Activity Logs**: Audit trail of all administrative actions
- **Sessions**: PostgreSQL-stored session data for Replit Auth

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database (`@neondatabase/serverless`)
- Connection via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OpenID Connect authentication via `ISSUER_URL` (defaults to `https://replit.com/oidc`)
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

### File Storage
- Local filesystem storage in `uploads/` directory
- Subdirectories: `photos/` for profile images, `qrcodes/` for generated QR codes

### Third-Party Libraries
- **QRCode**: Server-side QR code generation for passport public links
- **date-fns**: Date formatting with Russian locale support
- **Multer**: Multipart form handling for file uploads
- **memoizee**: Caching for OIDC configuration

### Build Tools
- **Vite**: Development server and production bundling
- **esbuild**: Server-side TypeScript bundling for production
- **Drizzle Kit**: Database schema management