# Overview

Ignitia (SynapLink) is a comprehensive dual-mode event and hackathon hosting platform that combines professional event management for organizations with a social, gamified ecosystem for students and professionals. The platform enables transparent event management across multiple event types (hackathons, conferences, meetups, fests) while fostering community building through social features, leaderboards, and achievements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for client-side routing with clean URL patterns
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Authentication**: JWT-based authentication with context provider pattern

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and middleware-based request processing
- **Real-time Features**: WebSocket server integration for live updates and notifications
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Middleware**: Custom logging, CORS handling, and authentication middleware

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations
- **Schema Design**: Comprehensive relational model supporting:
  - User management with roles (participant, organizer, admin)
  - Organization and event management
  - Team formation and member management
  - Multi-round submission workflows
  - Badge and certificate systems
  - Social features (followers, connections)
  - Leaderboards and point systems

## Key Architectural Patterns
- **Component Architecture**: Modular UI components with composition patterns
- **Type Safety**: End-to-end TypeScript with shared schema validation using Zod
- **Theme System**: CSS custom properties with light/dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Error Handling**: Centralized error boundaries and toast notifications
- **Code Organization**: Feature-based folder structure with shared utilities

## Event Management System
- **Dynamic Forms**: Configurable event creation with type-specific field validation
- **Round Management**: Multi-stage competition workflows with progression tracking
- **Submission System**: Flexible submission handling with file uploads and external links
- **Registration Flow**: Team-based and individual registration with invite systems

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with migration support
- **drizzle-kit**: Database migration and schema management tools

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitive components
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation utilities
- **class-variance-authority**: Component variant management

## Authentication & Security
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **connect-pg-simple**: PostgreSQL session store

## Development Tools
- **vite**: Fast build tool and development server
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration
- **tsx**: TypeScript execution for development

## Styling & UI
- **tailwindcss**: Utility-first CSS framework
- **autoprefixer**: CSS vendor prefixing
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging utility

## Real-time Communication
- **ws**: WebSocket server implementation for live features
- **WebSocket API**: Browser WebSocket client for real-time updates