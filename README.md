# 🏢 Employee Management System (EMS)

A professional, full-stack employee management system built with **Next.js 15**, **TypeScript**, **MongoDB**, and **TailwindCSS**.

![EMS Dashboard](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)

## ✨ Features

### 🔐 Authentication & Authorization
- Secure admin login with NextAuth.js
- Role-based access control (SuperAdmin, Admin, HR)
- JWT-based session management

### 👥 Employee Management
- **CRUD Operations**: Add, update, delete employees
- **Advanced Filtering**: Search by name, email, ID
- **Status Management**: Active, Inactive, On-Leave
- **Department Assignment**: Link employees to departments
- **Pagination**: Efficient data loading with 10 items per page

### 🏢 Department Management
- Create and manage departments
- Budget tracking per department
- Visual department statistics
- Employee count per department

### 💰 Salary Management
- Monthly salary records
- Bonus and deductions tracking
- Payment status (Pending, Paid, Cancelled)
- Net salary calculation
- Mark salaries as paid

### 📊 Dashboard Analytics
- **Stats Cards**: Total employees, active count, on-leave, departments
- **Department Chart**: Pie chart showing employee distribution
- **Hiring Trend**: Area chart showing monthly hiring patterns
- **Payroll Summary**: Total paid salaries with trends

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v4
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
employee-management/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── layout.tsx          # Auth layout
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── employees/          # Employee CRUD
│   │   ├── departments/        # Department management
│   │   ├── salary/             # Salary records
│   │   └── layout.tsx          # Dashboard layout
│   ├── api/
│   │   ├── auth/               # NextAuth routes
│   │   ├── employees/          # Employee API
│   │   ├── departments/        # Department API
│   │   ├── salary/             # Salary API
│   │   ├── stats/              # Dashboard stats
│   │   └── seed/               # Database seeding
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── dashboard/
│   │   ├── StatsCard.tsx       # Stat card component
│   │   ├── EmployeeTable.tsx   # Employee data table
│   │   ├── EmployeeForm.tsx    # Add/Edit employee form
│   │   ├── DepartmentChart.tsx # Pie chart
│   │   └── HiringTrend.tsx     # Area chart
│   ├── layout/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── Header.tsx          # Top header
│   └── ui/
│       └── Pagination.tsx      # Pagination component
├── lib/
│   ├── db.ts                   # MongoDB connection
│   └── auth.ts                 # NextAuth config
├── models/
│   ├── Admin.ts                # Admin schema
│   ├── Employee.ts             # Employee schema
│   ├── Department.ts           # Department schema
│   └── Salary.ts               # Salary schema
├── .env.local
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation

1. **Clone or navigate to the project**:
```bash
cd employee-management
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/employee-management
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-change-in-production
```

4. **Seed the database**:
```bash
# Start the dev server first
npm run dev

# Then in another terminal or browser, call:
curl -X POST http://localhost:3000/api/seed
# Or visit: http://localhost:3000/api/seed in your browser
```

This creates:
- 1 admin user: `admin@company.com` / `admin123`
- 5 departments (Engineering, Marketing, HR, Finance, Operations)
- 20 sample employees

5. **Access the application**:
```
http://localhost:3000
```

Login with: `admin@company.com` / `admin123`

## 📖 Usage

### Admin Login
1. Navigate to `/login`
2. Enter credentials: `admin@company.com` / `admin123`
3. Click "Sign In"

### Managing Employees
- **View All**: Navigate to "Employees" in sidebar
- **Add New**: Click "Add Employee" button
- **Edit**: Click edit icon on any employee row
- **Delete**: Click delete icon (with confirmation)
- **Filter**: Use search bar and status/department dropdowns
- **Paginate**: Use pagination controls at bottom

### Managing Departments
- **View All**: Navigate to "Departments" in sidebar
- **Add New**: Click "Add Department" button
- **Edit**: Click edit icon on department card
- **Delete**: Click delete icon (with confirmation)

### Managing Salaries
- **View All**: Navigate to "Salary" in sidebar
- **Add Record**: Click "Add Record" button
- **Mark as Paid**: Click checkmark icon on pending records
- **Delete**: Click delete icon

### Dashboard
- View real-time statistics
- Analyze employee distribution by department
- Track hiring trends over time
- Monitor total payroll

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with glassmorphism effects
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions with Framer Motion
- **Interactive Charts**: Hover effects and tooltips
- **Toast Notifications**: Real-time feedback for actions

## 🔒 Security

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Session management with NextAuth
- Environment variable protection

## 📊 API Routes

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Employees
- `GET /api/employees` - List employees (with pagination, search, filters)
- `POST /api/employees` - Create employee
- `GET /api/employees/[id]` - Get employee by ID
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/[id]` - Update department
- `DELETE /api/departments/[id]` - Delete department

### Salary
- `GET /api/salary` - List salary records (with pagination)
- `POST /api/salary` - Create salary record
- `PUT /api/salary/[id]` - Update salary record
- `DELETE /api/salary/[id]` - Delete salary record

### Stats
- `GET /api/stats` - Get dashboard statistics

### Seed
- `POST /api/seed` - Seed database with sample data

## 🧪 Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ems` |
| `NEXTAUTH_SECRET` | NextAuth secret key | Random string |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | Random string |

## 🤝 Contributing

This is a learning project. Feel free to fork and customize!

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎓 What You'll Learn

- **Next.js 15 App Router**: Modern React framework
- **TypeScript**: Type-safe development
- **MongoDB & Mongoose**: NoSQL database operations
- **NextAuth.js**: Authentication implementation
- **Complex CRUD**: Full create, read, update, delete operations
- **Data Tables**: Pagination, filtering, sorting
- **Charts & Visualization**: Recharts integration
- **Form Handling**: Validation and submission
- **API Routes**: RESTful API design
- **State Management**: React hooks and context
- **Responsive Design**: Mobile-first approach
- **Animations**: Framer Motion basics

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env.local`
- Verify network access if using MongoDB Atlas

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Authentication Issues
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set
- Check session configuration

## 📞 Support

For issues or questions, please check:
- MongoDB documentation: https://docs.mongodb.com
- Next.js documentation: https://nextjs.org/docs
- NextAuth.js documentation: https://next-auth.js.org

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
#   p r o j e c t - 3  
 #   p r o j e c t - 3  
 #   p r o j e c t - 3  
 #   p r o j e c t 3  
 #   p r o j e c t 3  
 #   e m s p r o j 3  
 #   e m s p r o j 3  
 