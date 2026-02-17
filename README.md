# 🛒 PulseKart - Modern E-Commerce Platform

A full-stack e-commerce platform built with Next.js 16, TypeScript, and PostgreSQL. PulseKart offers a complete solution for online retail with advanced features including inventory management, order processing, prescription uploads, chatbot support, and comprehensive admin tools.

![Next.js](https://img.shields.io/badge/Next.js-16.0.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🛍️ Customer Features

- **Product Catalog** - Browse and search products with advanced filtering
- **Shopping Cart** - Add, remove, and manage cart items
- **Prescription Upload** - Upload prescriptions for pharmaceutical products
- **Order Tracking** - Real-time order status updates
- **Address Management** - Save and manage multiple delivery addresses
- **Coupon System** - Apply discount coupons at checkout
- **AI Chatbot** - Get instant help with product queries
- **Payment Options** - Multiple payment methods including COD and prepaid
- **Return Management** - Easy returns and refunds process

### 👨‍💼 Admin Features

- **Dashboard** - Comprehensive analytics and insights
- **Inventory Management** - Track stock levels and manage products
- **Order Management** - Process and fulfill orders
- **Employee Management** - Manage staff and roles
- **Finance & Payroll** - Financial reporting and payroll processing
- **Delivery Management** - Assign and track deliveries
- **Warehouse Management** - Multi-warehouse support
- **Business Intelligence** - Advanced analytics and reporting
- **CMS** - Content management for pages and banners
- **Support Tickets** - Customer support ticket system

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend

- **Runtime**: Node.js
- **Framework**: NestJS (v10)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, NestJS Auth Module
- **Validation**: Zod (nestjs-zod)
- **Documentation**: Swagger / OpenAPI
- **Security**: Helmet, CORS

### DevOps

- **Containerization**: Docker & Docker Compose
- **Development**: Nest CLI, Turbopack

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for database)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ak1458/Smile-Fotilo-NEXT-js-app.git
cd Smile-Fotilo-NEXT-js-app
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pulsekart

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
```

Create a `.env` file in the `backend` directory:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/pulsekart
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Start the Database

```bash
docker compose up -d
```

This will start PostgreSQL in a Docker container.

### 4. Install Dependencies

**Frontend:**

```bash
npm install
```

**Backend:**

```bash
cd backend
npm install
```

### 5. Initialize the Database

```bash
cd backend
npx ts-node src/db/init.ts
```

### 6. Start Development Servers

**Option A: Using the batch script (Windows):**

```bash
start_dev.bat
```

**Option B: Manual start:**

Terminal 1 - Backend:

```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:

```bash
npm run dev
```

### 7. Access the Application

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:4000/v1>
- **Health Check**: <http://localhost:4000/health>

## 📁 Project Structure

```
pulse-kart/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel pages
│   ├── dashboard/           # User dashboard
│   ├── shop/                # Product catalog
│   ├── cart/                # Shopping cart
│   └── ...
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── db/             # Database utilities
│   │   └── config/         # Configuration files
│   └── package.json
├── components/              # Reusable React components
├── context/                 # React context providers
├── public/                  # Static assets
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker configuration
└── package.json            # Frontend dependencies
```

## 🔌 API Endpoints

### Authentication

- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - User login
- `POST /v1/auth/logout` - User logout

### Products

- `GET /v1/products` - Get all products
- `GET /v1/products/:id` - Get product by ID
- `POST /v1/products` - Create product (Admin)
- `PUT /v1/products/:id` - Update product (Admin)
- `DELETE /v1/products/:id` - Delete product (Admin)

### Orders

- `GET /v1/orders` - Get user orders
- `POST /v1/orders` - Create new order
- `GET /v1/orders/:id` - Get order details
- `PUT /v1/orders/:id/status` - Update order status (Admin)

### Inventory

- `GET /v1/inventory` - Get inventory levels
- `PUT /v1/inventory/:id` - Update inventory (Admin)

### Coupons

- `GET /v1/coupons` - Get available coupons
- `POST /v1/coupons/validate` - Validate coupon code
- `POST /v1/coupons` - Create coupon (Admin)

*For complete API documentation, see [API Documentation](./docs/)*

## 🛠️ Development

### Build for Production

**Frontend:**

```bash
npm run build
npm start
```

**Backend:**

```bash
cd backend
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🐳 Docker Deployment

The project includes Docker Compose configuration for easy deployment:

```bash
docker compose up -d
```

This will start:

- PostgreSQL database
- Backend API server
- Frontend Next.js application

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts and authentication
- `products` - Product catalog
- `orders` - Order information
- `order_items` - Order line items
- `inventory` - Stock management
- `coupons` - Discount coupons
- `addresses` - User addresses
- `prescriptions` - Uploaded prescriptions
- `tickets` - Support tickets
- `employees` - Staff management

For detailed schema, see [schema.sql](./backend/src/db/schema.sql)

## 🤝 Contributing

**New to the project?** Start here:

- 📚 [Project Structure](./PROJECT_STRUCTURE.md) - Understand the codebase
- 🎯 [Contributing Guide](./CONTRIBUTING.md) - How to make changes
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - How to deploy

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Follow the [coding guidelines](./CONTRIBUTING.md#-coding-guidelines)
4. Commit your changes: `git commit -m 'feat: add AmazingFeature'`
5. Push to the branch: `git push origin feature/AmazingFeature`
6. Open a Pull Request

## 🚀 Deployment

### Deploy on Render (Recommended)

We use Render for a unified, simple deployment suitable for startups.
Everything (Frontend, Backend, Database) runs on one platform.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

👉 **[Read the Deployment Guide](./DEPLOYMENT.md)**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ashish Kumar**

- GitHub: [@ak1458](https://github.com/ak1458)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- All contributors who help improve this project
- Open source community for the excellent tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ using Next.js and TypeScript**
