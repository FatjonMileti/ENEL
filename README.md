# ENEL - Monorepo

This repository contains four interconnected applications for ENEL's telesales and contract digitalization platform.

## Project Structure

```
ENEL/
├── enel-contract-digitalisation-server/   # Backend API (FeathersJS + Express + PostgreSQL)
├── enel-fast-contracting-web/             # Fast Contracting Web CMS (React + Express)
├── enel-telesales-agent/                  # Telesales Agent App (CRA + Material UI v4)
└── enel-telesales-customer/               # Telesales Customer App (CRA + MUI v5)
```

---

## 1. enel-contract-digitalisation-server

**Backend API server** for mobile app dealing with new/upgraded contracts.

### Tech Stack
- **Framework**: FeathersJS v3 + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Auth**: JWT authentication (`@feathersjs/authentication-jwt`)
- **Real-time**: Socket.io (`@feathersjs/socketio`)
- **PDF Generation**: muhammara, pdf2json, xlsx
- **Email**: nodemailer
- **Scheduler**: node-schedule
- **Node**: >= 8.0.0 (recommended v10 via nvm)

### Key Dependencies
- `@feathersjs/feathers`, `@feathersjs/express`, `@feathersjs/socketio`
- `sequelize`, `pg`, `pg-hstore`
- `react`, `react-dom`, `react-redux`, `redux` (for CMS parcel builds)
- `axios`, `moment`, `lodash`, `validator`

### Getting Started

```bash
cd enel-contract-digitalisation-server

# Use Node v10
nvm use 10.13.0

# Install dependencies
npm install

# Setup environment
cp .env.example .env  # Configure PG_CONNECTION_STRING, PG_SCHEMA, JWT_SECRET, etc.

# Database setup
npx sequelize db:create
# Create schema defined in PG_SCHEMA manually
npx sequelize db:migrate
npx sequelize db:seed:all

# Development (with auto-reload)
npm run local

# Production
npm start

# CMS builds (parcel)
npm run cms-v2-build
npm run cms-v2-watch
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run local` | Start with nodemon (dev) |
| `npm start` | Production start |
| `npm test` | Run eslint + mocha tests |
| `npm run mocha` | Run mocha tests only |
| `npm run cms-v2-build` | Build CMS v2 with parcel |
| `npm run cms-v2-watch` | Watch CMS v2 |

### Database
- Uses PostgreSQL with Sequelize migrations
- Run `docker-compose up` for containerized DB (if docker-compose.yml exists)
- Migrations in `migrations/` folder
- Seeders for initial users and city data

---

## 2. enel-fast-contracting-web

**Footprints Location-Based Marketing CMS** - React/Express isomorphic application.

### Tech Stack
- **Frontend**: React 16.7, Redux, React Router v3
- **UI**: Material UI v4 (`@material-ui/core`)
- **Build**: Webpack 3, Babel 6
- **Server**: Express 4.14 (SSR)
- **Styling**: SASS, css-loader, glamor
- **Charts**: chart.js, react-chartjs-2
- **Maps**: react-google-map
- **PDF**: pdfjs-dist

### Getting Started

```bash
cd enel-fast-contracting-web

# Use Node v10
nvm use 10.13.0

# Setup environment
cp .env.example .env
nano .env  # Update variables

# Install dependencies
npm install

# Development
npm run dev

# Production build & start
npm run deploy:prod  # lint + test + clean + compile
npm start
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (nodemon) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Karma tests |
| `npm run compile` | Production build |
| `npm run deploy` | Full deploy pipeline |

### Default Credentials
- **Username**: admin
- **Password**: admin

---

## 3. enel-telesales-agent

**Telesales Agent Web Application** - Internal tool for telesales agents.

### Tech Stack
- **Framework**: Create React App 2.1 (`react-scripts`) with `react-app-rewired`
- **React**: 16.7
- **UI**: Material UI v4 (`@material-ui/core`, `@material-ui/icons`, `@material-ui/pickers`)
- **State**: Redux 4 + Redux Thunk
- **Forms**: `informed`
- **Routing**: React Router v3
- **Styling**: node-sass (SASS), react-jss
- **PDF**: pdfjs-dist, react-cropper
- **Webcam**: react-webcam
- **Signatures**: signature_pad, trim-canvas

### Getting Started

```bash
cd enel-telesales-agent

# Use Node v10
nvm use 10.13.0

# Setup environment
cp .env.example .env
nano .env

# Install dependencies
npm install

# Development (runs on port 3001)
npm run start
# Windows: npm run start-windows

# Production build
npm run build

# Test
npm test
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run start` | Dev server on port 3001 |
| `npm run start-windows` | Dev server on Windows |
| `npm run build` | Production build |
| `npm test` | Run tests (jsdom) |

---

## 4. enel-telesales-customer

**Telesales Customer Web Application** - Customer-facing portal.

### Tech Stack
- **Framework**: Create React App 5 (`react-scripts`) with `craco` (CRACO)
- **React**: 18.2
- **UI**: MUI v5 (`@mui/material`, `@emotion/react`, `@emotion/styled`, `styled-components`)
- **State**: Redux 4.2 + Redux Thunk + React-Redux 8
- **Routing**: React Router v6 (`react-router-dom`)
- **Forms**: `informed` (via react-reformed in other apps)
- **Styling**: SASS (node-sass), styled-components
- **PDF**: pdfjs-dist v3.5, cropperjs, react-cropper
- **Webcam**: react-webcam v7
- **Signatures**: signature_pad v4, react-signature-canvas

### Getting Started

```bash
cd enel-telesales-customer

# Use Node v10
nvm use 10.13.0

# Setup environment
cp .env.example .env
nano .env

# Install dependencies
npm install

# Development (runs on port 3002)
npm run start
# Windows: npm run start-windows

# Production build
npm run build

# Test
npm test
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run start` | Dev server on port 3002 (craco) |
| `npm run start-windows` | Dev server on Windows |
| `npm run build` | Production build (craco) |
| `npm test` | Run tests (craco) |

---

## Common Requirements

- **Node.js**: v10.13.0 (managed via nvm)
- **npm**: 6.4.1 (comes with Node v10 via nvm)
- **PostgreSQL**: For backend server
- **Environment files**: Each app has `.env.example` - copy to `.env` and configure

## Development Workflow

1. **Start PostgreSQL** (local or docker)
2. **Start Backend** (`enel-contract-digitalisation-server`):
   ```bash
   cd enel-contract-digitalisation-server && npm run local
   ```
3. **Start Frontend Apps** (in separate terminals):
   ```bash
   # Terminal 1 - Agent app (port 3001)
   cd enel-telesales-agent && npm run start
   
   # Terminal 2 - Customer app (port 3002)
   cd enel-telesales-customer && npm run start
   
   # Terminal 3 - Fast Contracting Web (check port in config)
   cd enel-fast-contracting-web && npm run dev
   ```

## Environment Variables

Each application has its own `.env.example` file. Key variables:

### Backend (`enel-contract-digitalisation-server`)
- `PG_CONNECTION_STRING` - PostgreSQL connection
- `PG_SCHEMA` - Database schema name
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - development/production
- `PORT` - Server port (default 3030)

### Frontend Apps
- `REACT_APP_API_URL` - Backend API endpoint
- `REACT_APP_GOOGLE_MAPS_KEY` - Google Maps API key
- `PORT` - Dev server port (3001 agent, 3002 customer)

## Testing

| App | Test Runner | Command |
|-----|-------------|---------|
| Backend | Mocha | `npm run mocha` |
| Fast Contracting | Karma | `npm test` |
| Telesales Agent | Jest (CRA) | `npm test` |
| Telesales Customer | Jest (CRA) | `npm test` |

## Deployment

### Backend
- Use PM2: `pm2 start src/ --name enel-backend`
- Ensure `NODE_ENV=production`
- Run migrations: `npx sequelize db:migrate`
- Build CMS: `npm run cms-v2-build`

### Frontend Apps
- Build: `npm run build` (outputs to `build/` or `dist/`)
- Serve static files via Nginx/Apache or deploy to Vercel/Netlify
- Configure reverse proxy to backend API

## License

Private repository - Fullscreen Digital / ENEL