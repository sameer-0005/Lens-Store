# Lens Store - Inventory Management System

A mobile-first web application for managing sunglasses lens inventory. Built with the MERN stack.

## Features

- 📱 Mobile-first responsive design
- 🔐 JWT authentication (1 year token validity)
- 📊 Dashboard with inventory stats and low stock alerts
- 🔍 Search and filter lenses by specifications
- ➕ Add, edit, and delete lenses
- 📤 Bulk import from CSV/Excel
- 🌙 Dark mode support
- ⚡ Quick quantity adjustments (+1, +2, -1, -2)

## Tech Stack

- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## Project Structure

```
lens-store/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── seed.js            # Database seeder
│   └── server.js          # Entry point
│
└── client/                 # Frontend React app
    ├── src/
    │   ├── api/           # Axios configuration
    │   ├── components/    # Reusable components
    │   ├── context/       # React contexts
    │   └── pages/         # Page components
    └── public/            # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd lens-store
   ```

2. **Setup Backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   cp .env.example .env
   # Edit .env if needed (defaults to localhost:5000)
   npm install
   ```

### Configuration

**Server `.env`:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lensstore
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

**Client `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Seed the database** (creates admin user + sample data)
   ```bash
   cd server
   npm run seed
   ```

2. **Start the backend**
   ```bash
   npm run dev   # Development with nodemon
   # or
   npm start     # Production
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Login

```
Email: admin@lensstore.com
Password: admin123
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/lens` | Get all lenses (with filters) |
| GET | `/api/lens/stats` | Dashboard statistics |
| GET | `/api/lens/low-stock` | Low stock items |
| POST | `/api/lens` | Create lens |
| POST | `/api/lens/import` | Bulk import |
| GET | `/api/lens/:id` | Get single lens |
| PUT | `/api/lens/:id` | Update lens |
| DELETE | `/api/lens/:id` | Delete lens |
| PATCH | `/api/lens/:id/quantity` | Adjust quantity |

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `server`
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=5000`
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Deploy

### Database (MongoDB Atlas)

1. Create a free cluster on MongoDB Atlas
2. Create a database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Get connection string and add to server `.env`

## License

MIT
