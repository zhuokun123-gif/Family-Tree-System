# CSMPR - Family Tree Visualization and Exploration System

## 🌳 **Project Overview**

The CSMPR Family Tree Visualization and Exploration System is a comprehensive web-based application that allows users to visualize, explore, and manage complex family tree relationships. Built with modern web technologies, it provides both basic and advanced visualization modes with role-based access control.

**Developer**: Zhuokun Liu  
**Project Type**: Full-stack web application  
**Architecture**: Vue.js frontend + Node.js backend + MySQL database

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18+ and npm
- MySQL running on `localhost:3306`
- Modern web browser (Chrome, Firefox, Safari, Edge)

### **Installation Steps**

1. **Clone or Download the Project**
   ```bash
   # If using Git
   git clone [repository-url]
   cd CSMPR
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd 09_BACKEND
   npm install
   
   # Install frontend dependencies
   cd ../08_FRONTEND
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `family tree`
   - Import the data from `05_DATA_FILES/` directory
   - Run the database setup scripts from `06_SCRIPTS_AND_UTILITIES/`

4. **Environment Configuration**
   - Create `09_BACKEND/.env` file with database credentials
   - Configure CORS and JWT settings

5. **Start the Application**
   ```bash
   # Start backend server (Terminal 1)
   cd 09_BACKEND
   npm run dev
   
   # Start frontend server (Terminal 2)
   cd 08_FRONTEND
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

---

## 📁 **Project Structure**

```
CSMPR/
├── 01_DOCUMENTATION/          # Project documentation
├── 02_ACADEMIC_DOCUMENTS/     # Academic reports
├── 03_DEVELOPMENT_DOCS/       # Technical documentation
├── 04_DIAGRAMS_AND_DESIGNS/   # Visual diagrams
├── 05_DATA_FILES/            # Raw and processed data
├── 06_SCRIPTS_AND_UTILITIES/ # Data processing scripts
├── 07_IMAGES_AND_ASSETS/     # Images and assets
├── 08_FRONTEND/              # Vue.js frontend application
├── 09_BACKEND/               # Node.js backend application
├── 10_ROOT_CONFIG/           # Root configuration files
└── 11_LEGACY_FILES/          # Legacy files
```

---

## 🎯 **Key Features**

### **Dual Visualization Modes**
- **Basic D3.js Tree**: Interactive hierarchical tree visualization
- **Enhanced Canvas Tree**: Advanced relationship mapping with color coding
- **Unified Tree View**: Combined features from both modes

### **Comprehensive Relationship Mapping**
- **Direct Relatives**: Parents, children, spouses
- **Collateral Relatives**: Siblings, cousins, uncles, aunts, grandparents
- **Generation Tracking**: Automatic generation calculation
- **Relationship Degrees**: Measures of separation between family members

### **Role-Based Access Control**
- **Admin Interface**: Full CRUD operations for data management
- **Visitor Interface**: Read-only access for exploration
- **Secure Authentication**: JWT-based authentication system

### **Advanced Features**
- **Real-time Search**: Find people by name or ID
- **Interactive Navigation**: Click-to-expand tree nodes
- **Export Capabilities**: Save trees as SVG or PNG
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Analytics**: Family statistics and insights

---

## 🖥️ **User Interface Guide**

### **Main Navigation**
- **Search Page**: Find family members by name or ID
- **Tree Views**: Access different visualization modes
- **Admin Dashboard**: Manage data (admin only)
- **Statistics**: View family tree analytics

### **Tree Visualization Controls**
- **Zoom & Pan**: Mouse wheel to zoom, drag to pan
- **Node Selection**: Click nodes to view details
- **Expand/Collapse**: Toggle family branches
- **Search**: Real-time search within trees
- **Export**: Save visualizations as images

### **Color Coding System**
- **Blue Nodes**: Male family members
- **Pink Nodes**: Female family members
- **Gray Nodes**: Unknown gender
- **Red Borders**: Deceased individuals
- **Orange Borders**: Selected person

---

## 🔧 **Configuration Guide**

### **Backend Configuration**
Create `09_BACKEND/.env` file:
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=family tree
ADMIN_USER=admin
ADMIN_PASS=123456
```

### **Database Setup**
1. Create MySQL database named `family tree`
2. Run database schema update:
   ```bash
   cd 06_SCRIPTS_AND_UTILITIES
   node update_database_schema.js
   ```
3. Import processed data:
   ```bash
   node import_processed_data.js
   ```

### **Frontend Configuration**
The frontend is pre-configured to work with the backend. No additional configuration needed.

---

## 📊 **Data Management**

### **Data Sources**
- **Raw Data**: Located in `05_DATA_FILES/`
  - `FamilyTree_People.csv` - Original people data
  - `FamilyTree_Families.csv` - Original families data
- **Processed Data**: Enhanced with derived values
  - `processed_familytree.csv` - Processed CSV data
  - `processed_familytree.json` - Processed JSON data

### **Data Processing Scripts**
Located in `06_SCRIPTS_AND_UTILITIES/`:
- `process_family_tree_data.js` - Main data processing
- `import_processed_data.js` - Database import
- `update_database_schema.js` - Schema updates
- `verify_living_people.js` - Data verification

### **Derived Values**
The system automatically calculates:
- **Gender**: Based on family relationships (Father/Mother)
- **Age**: Calculated from birth and death years
- **Life Status**: Living/Deceased based on age
- **Marital Status**: Married/Single based on spouse data

---

## 🔌 **API Documentation**

### **Public Endpoints**
- `GET /api/people` - Retrieve all people
- `GET /api/families` - Retrieve all families
- `GET /api/person/:id` - Get specific person details
- `GET /api/enhanced-tree/person/:id` - Get enhanced tree data
- `GET /api/enhanced-tree/search/:name` - Search by name
- `GET /api/enhanced-tree/stats` - Get tree statistics

### **Protected Endpoints (Admin Only)**
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/people` - Create new person
- `PUT /api/admin/people/:id` - Update person
- `DELETE /api/admin/people/:id` - Delete person
- `POST /api/admin/families` - Create new family
- `PUT /api/admin/families/:id` - Update family
- `DELETE /api/admin/families/:id` - Delete family

---

## 🎨 **Visualization Modes**

### **1. Basic D3.js Tree**
- **Access**: Search page → "View Tree" button
- **Features**: Interactive hierarchical layout
- **Best For**: Simple family structures, quick overview

### **2. Enhanced Canvas Tree**
- **Access**: Search page → "Enhanced Tree" button
- **Features**: Complex relationship mapping, color coding
- **Best For**: Detailed family analysis, complex relationships

### **3. Unified Tree View**
- **Access**: Any tree page → "View Unified Tree" button
- **Features**: Combined D3.js and canvas features
- **Best For**: Comprehensive family exploration

---

## 👥 **User Roles**

### **Visitor (Default)**
- **Access**: Read-only access to family tree data
- **Features**: Search, view trees, explore relationships
- **Limitations**: Cannot modify data

### **Administrator**
- **Access**: Full system access
- **Features**: All visitor features plus data management
- **Login**: Use admin credentials from configuration
- **Management**: Add, edit, delete people and families

---

## 🛠️ **Development Guide**

### **Frontend Development**
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Location**: `08_FRONTEND/`
- **Key Dependencies**: D3.js, Chart.js, Vue Router

### **Backend Development**
- **Framework**: Node.js with Express.js
- **Database**: MySQL with mysql2 driver
- **Location**: `09_BACKEND/`
- **Key Dependencies**: Express, JWT, CORS

### **Adding New Features**
1. **Frontend**: Add components in `08_FRONTEND/src/components/`
2. **Backend**: Add routes in `09_BACKEND/src/routes/`
3. **Database**: Update schema and models as needed
4. **Documentation**: Update relevant docs in `01_DOCUMENTATION/`

---

## 🐛 **Troubleshooting**

### **Common Issues**

**1. Database Connection Failed**
- Check MySQL is running on port 3306
- Verify database credentials in `.env` file
- Ensure database `family tree` exists

**2. Frontend Not Loading**
- Check if backend is running on port 3000
- Verify CORS configuration
- Check browser console for errors

**3. Tree Visualization Not Displaying**
- Ensure D3.js is properly loaded
- Check for JavaScript errors in console
- Verify data is properly formatted

**4. Authentication Issues**
- Check JWT secret configuration
- Verify admin credentials
- Clear browser localStorage

### **Debug Steps**
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connections
4. Review server logs for errors

---

## 📈 **Performance Optimization**

### **Database Optimization**
- Strategic indexing on frequently queried columns
- Connection pooling for efficient resource management
- Query optimization for large datasets

### **Frontend Optimization**
- Lazy loading for large family trees
- Efficient rendering with D3.js
- Responsive design for mobile devices

### **Scalability Considerations**
- Tested with datasets up to 1000 individuals
- Linear performance scaling observed
- Memory usage remains stable

---

## 🔒 **Security Features**

### **Authentication**
- JWT-based token authentication
- Role-based access control (RBAC)
- Secure session management

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection through output encoding
- CORS configuration for secure requests

---

## 📚 **Additional Resources**

### **Documentation**
- **Project Overview**: `01_DOCUMENTATION/PROJECT_OVERVIEW.md`
- **Organization Summary**: `01_DOCUMENTATION/PROJECT_ORGANIZATION_SUMMARY.md`
- **Technical Docs**: `03_DEVELOPMENT_DOCS/`
- **API Reference**: See API Documentation section above

### **Data Files**
- **Raw Data**: `05_DATA_FILES/`
- **Processing Scripts**: `06_SCRIPTS_AND_UTILITIES/`
- **Sample Data**: Included in data files directory

### **Visual Resources**
- **Diagrams**: `04_DIAGRAMS_AND_DESIGNS/`
- **Presentations**: HTML presentation files included
- **Flowcharts**: API and UI flow diagrams

---

## 🤝 **Contributing**

### **Code Standards**
- Follow existing naming conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

### **File Organization**
- Place new files in appropriate directories
- Follow the established structure
- Update this README for significant changes

---

## 📞 **Support**

### **Technical Issues**
- Check troubleshooting section above
- Review error logs and console output
- Verify configuration settings

### **Feature Requests**
- Document requirements clearly
- Consider impact on existing functionality
- Follow established development patterns

---

## 📄 **License**

This project is developed for academic purposes as part of the CSMPR coursework. Please refer to the academic documentation for usage terms and conditions.

---

## 🎉 **Getting Started**

1. **Follow the Quick Start Guide** above
2. **Explore the different visualization modes**
3. **Try the search functionality**
4. **Experiment with the admin features** (if you have admin access)
5. **Check out the documentation** in `01_DOCUMENTATION/`

**Happy exploring your family tree! 🌳**

---

*Last updated: September 12, 2025*  
*Version: 1.0.0*  
*Developer: Zhuokun Liu*
