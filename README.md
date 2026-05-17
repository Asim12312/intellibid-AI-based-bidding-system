# IntelliBid Monorepo

This project is a professional auction platform built with a Next.js frontend and an Express API backend.

## Project Structure

```
intellibid-fyp/
├── client/          # Next.js 16 App Router Frontend
│   ├── app/         # Role-based route groups: (auth), (buyer), (seller), (admin)
│   ├── components/  # Reusable UI, shared, and layout components
│   └── lib/         # API client and utility functions
├── server/          # Express API Backend
│   ├── src/         # API source code (Modules, Routes, Controllers, Models)
│   └── .env.example # Environment variables template
├── shared/          # Shared constants and validation logic
└── package.json     # Workspace configuration for monorepo
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a cloud instance)

### Installation

1. Clone the repository
2. Install dependencies for the entire project:
   ```bash
   npm install
   ```

### Running the Project

You can run the frontend and backend separately or together using the provided scripts.

- **Run Client only:**
  ```bash
  npm run dev:client
  ```
- **Run Server only:**
  ```bash
  npm run dev:server
  ```
- **Run Both:**
  ```bash
  npm run dev
  ```

### Backend Configuration

Copy `server/.env.example` to `server/.env` and update the variables with your actual configuration (e.g., MongoDB URI, JWT Secret).

## Architecture Details

- **Role-Based Routing**: The client uses Next.js Route Groups to segregate dashboards for Buyers, Sellers, and Admins.
- **Unified Styling**: Tailwind CSS 4 and OKLCH color palettes provide a consistent Neo-Brutalism aesthetic.
- **Scalable API**: The server follows a modular architecture where each feature (auth, user, product, etc.) is encapsulated in its own module.
- **Shared Logic**: Validation schemas and constants are shared between the client and server to ensure consistency.
