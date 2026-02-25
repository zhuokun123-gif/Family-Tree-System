# CSMPR Quick Setup Guide

## 🚀 **5-Minute Setup**

### **Step 1: Prerequisites Check**
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check MySQL (should be running on port 3306)
mysql --version
```

### **Step 2: Install Dependencies**
```bash
# From project root directory
npm install

# Backend dependencies
cd 09_BACKEND
npm install

# Frontend dependencies
cd ../08_FRONTEND
npm install
```

### **Step 3: Database Setup**
```sql
-- Create database in MySQL
CREATE DATABASE `family tree`;

-- Use the database
USE `family tree`;
```

### **Step 4: Environment Configuration**
Create `09_BACKEND/.env`:
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key-here
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=family tree
ADMIN_USER=admin
ADMIN_PASS=123456
```

### **Step 5: Import Data**
```bash
# Run database schema update
cd 06_SCRIPTS_AND_UTILITIES
node update_database_schema.js

# Import processed data
node import_processed_data.js
```

### **Step 6: Start Application**
```bash
# Terminal 1 - Backend
cd 09_BACKEND
npm run dev

# Terminal 2 - Frontend
cd 08_FRONTEND
npm run dev
```

### **Step 7: Access Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## ✅ **Verification**

1. **Backend Health Check**: Visit `http://localhost:3000/api/health`
2. **Frontend Load**: Visit `http://localhost:5173`
3. **Database Connection**: Check console for "Connected to database" message
4. **Sample Search**: Try searching for a person in the frontend

## 🎯 **Quick Test**

1. Open http://localhost:5173
2. Search for "Private Fancy" (sample person)
3. Click "View Tree" to see basic visualization
4. Click "Enhanced Tree" to see advanced visualization
5. Try the "Unified Tree" for combined features

## 🆘 **Common Issues**

**Port Already in Use**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173
```

**Database Connection Failed**:
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database exists

**Module Not Found**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 **Next Steps**

- Read the full [README.md](README.md) for detailed documentation
- Explore the [Project Organization Summary](PROJECT_ORGANIZATION_SUMMARY.md)
- Check out the technical docs in `03_DEVELOPMENT_DOCS/`

---

*This guide gets you up and running in 5 minutes!*
