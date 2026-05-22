# Role-Based Access Control & User Activity Tracking System

**A professional full-stack application showcasing secure RBAC, task workflow management, and audit-ready activity tracking.**

---

## 🌟 Project Summary

This repository presents a complete demo application built to demonstrate:
- **Role-based access control** with admin, manager, and user permission levels
- **Task management workflows** including assignment and status updates
- **Activity logging** for audit trails and analytics
- **React + Vite frontend** and **Express backend**
- **JSON file-backed persistence** for simple setup without a database

This README is designed to make the project easy to present to clients and GitHub reviewers.

---

## 🏗️ Project Structure

```
.
├── backend/                          # Node.js Express backend
│   ├── config/                       # Backend configuration files
│   ├── controllers/                  # API route handlers
│   ├── middleware/                   # Auth and RBAC middleware
│   ├── models/                       # Data model and storage helpers
│   ├── routes/                       # API endpoints
│   ├── utils/                        # Helper utilities
│   ├── dataStore.js                  # File-backed persistence layer
│   ├── package.json                  # Backend dependencies and scripts
│   └── server.js                     # Express server entrypoint
├── frontend/                         # React + Vite frontend
│   ├── src/                          # Application source code
│   ├── components/                   # UI components
│   ├── context/                      # Auth and app state
│   ├── pages/                        # Page-level views
│   ├── services/                     # API wrappers
│   ├── styles/                       # Styling and layout
│   ├── package.json                  # Frontend dependencies and scripts
│   └── vite.config.js                # Vite configuration
├── API_SPECIFICATION.md              # API endpoints and request examples
├── API_TESTING_GUIDE.md              # API usage and validation
├── IMPLEMENTATION_PLAN.md            # Project implementation roadmap
├── PROJECT_STRUCTURE.md              # Repository structure documentation
├── RBAC_REFERENCE_GUIDE.md           # Role and permission definitions
└── README.md                         # Project overview and setup guide
```

---



## 📚 Documentation

### Comprehensive Guides
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Detailed project phases and implementation checklist
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** - Complete API endpoints and request/response formats
- **[RBAC_REFERENCE_GUIDE.md](./RBAC_REFERENCE_GUIDE.md)** - Role permissions matrix and security guidelines

---

## 🔐 Role-Based Access Control

### User Roles

**👨‍💼 ADMIN**
- Full system access
- Manage all users (create, update, delete)
- View all tasks and activity logs
- Access to analytics and reports
- System configuration management

**👔 MANAGER**
- View all users (read-only)
- View and reassign all tasks
- View activity logs
- Cannot delete users or modify roles

**👤 USER**
- Manage own profile
- Create and manage own tasks
- View own activity logs
- Limited to personal data

### Permission Matrix
See [RBAC_REFERENCE_GUIDE.md](./RBAC_REFERENCE_GUIDE.md) for detailed permission matrix.

---

## 💾 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin|manager|user),
  isActive: Boolean,
  department: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  assignedTo: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  status: String (pending|in-progress|completed|cancelled),
  priority: String (low|medium|high|critical),
  dueDate: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Log Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  action: String (login|logout|create|update|delete|view|export|import),
  resource: String,
  resourceId: ObjectId,
  changes: Mixed,
  ipAddress: String,
  userAgent: String,
  status: String (success|failure),
  errorMessage: String,
  timestamp: Date
}
```

---

## 🧪 Testing

### Backend API Testing


1. **Using Postman**
   - Import collection from `postman_collection.json` (when provided)
   - Set environment variables (base_url, token)
   - Run test suite

2. **Manual Testing Checklist**
   - [ ] Register new user
   - [ ] Login with credentials
   - [ ] Access protected routes
   - [ ] Verify role-based access
   - [ ] Test user can only see own tasks
   - [ ] Test admin can see all data
   - [ ] Verify activity logging

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Role-Based Authorization** - Granular permission control
- ✅ **Input Validation** - Mongoose schema validation
- ✅ **Error Handling** - Centralized error management
- ✅ **Activity Logging** - Track all user actions
- ✅ **CORS Protection** - Cross-origin request handling
- ✅ **Helmet.js** - Security headers middleware
- ✅ **Rate Limiting** - Recommended for production

---

## 📊 Analytics Features

- User statistics (total, active, by role)
- Task metrics (total, completed, pending, by status)
- Activity trends (daily, weekly, monthly)
- Most active users
- Action frequency analysis
- Success/failure rates

---

## 🌳 Git Workflow

### Current Branch
```
Branch: feature/role-based-access-control
Status: In Progress

```


## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "joi": "^17.9.2",
  "axios": "^1.3.0"
}
```

### Frontend (To Install)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x.x",
  "axios": "^1.3.0",
  "tailwindcss": "^3.x.x",
  "chart.js": "^4.x.x",
  "recharts": "^2.x.x",
  "jwt-decode": "^3.x.x"
}
```

---

## 🚦 Environment Variables

### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Storage
DATA_STORE_PATH=./data/storage.json


# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
```

---

## 📋 Implementation Checklist

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for:
- ✅ Completed backend setup
- ⏳ Remaining backend enhancements
- ⏳ Frontend components
- ⏳ Integration testing
- ⏳ Git workflow and deployment

---

## 🤝 Contributing

### Development Guidelines
1. Work on `feature/role-based-access-control` branch
2. Follow the implementation plan in order
3. Commit changes with meaningful messages
4. Test thoroughly before pushing
5. Create PR when feature is complete

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 🎯 Project Goals

- ✅ Implement secure role-based access control
- ✅ Create comprehensive activity logging system
- ✅ Build admin dashboard for system management
- ✅ Build user dashboard for personal task management
- ✅ Ensure proper API security and validation
- ✅ Maintain clean code and proper folder structure
- ✅ Complete proper Git workflow and documentation






