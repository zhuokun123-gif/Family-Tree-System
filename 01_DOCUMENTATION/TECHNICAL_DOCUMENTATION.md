# CSMPR Technical Documentation

## 🏗️ **System Architecture**

### **Technology Stack**
- **Frontend**: Vue.js 3 + Vite + D3.js + HTML5 Canvas
- **Backend**: Node.js + Express.js + MySQL2
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Build Tools**: Vite, Nodemon

### **Architecture Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vue.js 3)    │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ - SearchPage    │    │ - Express.js    │    │ - People Table  │
│ - TreePage      │    │ - REST API      │    │ - Families Table│
│ - AdminPanel    │    │ - Authentication│    │ - Indexes       │
│ - Components    │    │ - Middleware    │    │ - Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **familytree_people Table**
```sql
CREATE TABLE familytree_people (
    Personal_ID VARCHAR(50) PRIMARY KEY,
    Forenames VARCHAR(100),
    Surname VARCHAR(100),
    Birth_Year INT,
    Death_Year INT,
    Parents_ID VARCHAR(50),
    Spouse_ID VARCHAR(50),
    Marriage_Year INT,
    Gender VARCHAR(20) DEFAULT 'Unknown',
    Age INT DEFAULT NULL,
    Life_Status VARCHAR(20) DEFAULT 'Unknown',
    Marital_Status VARCHAR(20) DEFAULT 'Unknown'
);
```

#### **familytree_families Table**
```sql
CREATE TABLE familytree_families (
    Family_ID VARCHAR(50) PRIMARY KEY,
    Father_ID VARCHAR(50),
    Mother_ID VARCHAR(50),
    Child_ID_1 VARCHAR(50),
    Child_ID_2 VARCHAR(50),
    Child_ID_3 VARCHAR(50),
    Marriage_Year INT,
    Family_Status VARCHAR(20) DEFAULT 'Active'
);
```

### **Indexes**
```sql
-- Primary indexes
CREATE INDEX idx_people_id ON familytree_people(Personal_ID);
CREATE INDEX idx_families_id ON familytree_families(Family_ID);

-- Foreign key indexes
CREATE INDEX idx_people_parents ON familytree_people(Parents_ID);
CREATE INDEX idx_people_spouse ON familytree_people(Spouse_ID);
CREATE INDEX idx_families_father ON familytree_families(Father_ID);
CREATE INDEX idx_families_mother ON familytree_families(Mother_ID);

-- Search indexes
CREATE INDEX idx_people_name ON familytree_people(Forenames, Surname);
CREATE INDEX idx_people_birth ON familytree_people(Birth_Year);
```

---

## 🔌 **API Endpoints**

### **Public Endpoints**

#### **People Management**
```http
GET /api/people
GET /api/person/:id
GET /api/enhanced-tree/person/:id
```

#### **Family Management**
```http
GET /api/families
GET /api/enhanced-tree/search/:name
GET /api/enhanced-tree/stats
```

### **Protected Endpoints (Admin Only)**

#### **Authentication**
```http
POST /api/admin/login
Body: { "username": "admin", "password": "123456" }
Response: { "token": "jwt-token" }
```

#### **People CRUD**
```http
POST /api/admin/people
PUT /api/admin/people/:id
DELETE /api/admin/people/:id
```

#### **Families CRUD**
```http
POST /api/admin/families
PUT /api/admin/families/:id
DELETE /api/admin/families/:id
```

### **Response Format**
```json
{
  "success": true,
  "data": {
    "person": {
      "personalId": "I122593541807",
      "forenames": "John",
      "surname": "Smith",
      "birthYear": 1950,
      "deathYear": null
    },
    "relatives": [...],
    "treeStats": {...}
  },
  "message": "Operation completed successfully"
}
```

---

## 🎨 **Frontend Architecture**

### **Component Structure**
```
src/
├── components/
│   ├── FamilyTree.vue              # Basic D3.js tree
│   ├── EnhancedFamilyTree.vue      # Canvas-based tree
│   ├── UnifiedFamilyTree.vue       # Combined tree view
│   └── charts/
│       ├── BarChart.vue
│       ├── LineChart.vue
│       └── PieChart.vue
├── views/
│   ├── SearchPage.vue              # Main search interface
│   ├── TreePage.vue                # Basic tree page
│   ├── EnhancedTreePage.vue        # Enhanced tree page
│   ├── UnifiedTreePage.vue         # Unified tree page
│   ├── AdminDashboard.vue          # Admin interface
│   └── AdminLogin.vue              # Login page
├── router/
│   └── index.js                    # Vue Router config
└── utils/                          # Utility functions
```

### **State Management**
- **Vue 3 Composition API**: Reactive state management
- **Local Storage**: User session persistence
- **Axios**: HTTP client for API calls
- **Vue Router**: Client-side routing

### **Key Dependencies**
```json
{
  "vue": "^3.4.27",
  "vue-router": "^4.3.2",
  "axios": "^1.7.2",
  "d3": "^7.9.0",
  "chart.js": "^4.5.0",
  "recharts": "^3.1.2"
}
```

---

## 🔧 **Backend Architecture**

### **File Structure**
```
src/
├── server.js                       # Main server file
├── db.js                          # Database configuration
├── middleware/
│   └── auth.js                    # JWT authentication
├── models/
│   ├── Member.js                  # Member data model
│   └── FamilyTree.js              # Family tree model
└── routes/
    ├── admin.js                   # Admin routes
    ├── people.js                  # People routes
    ├── families.js                # Family routes
    ├── person.js                  # Individual person routes
    ├── enhanced-people.js         # Enhanced people routes
    ├── enhanced-families.js       # Enhanced families routes
    └── enhanced-tree.js           # Enhanced tree routes
```

### **Key Dependencies**
```json
{
  "express": "^4.19.2",
  "mysql2": "^3.9.2",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5"
}
```

---

## 🔐 **Security Implementation**

### **Authentication**
```javascript
// JWT Token Generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Token Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### **Authorization**
```javascript
// Role-based access control
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### **Data Protection**
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries used throughout
- **XSS Protection**: Output encoding for all user data
- **CORS Configuration**: Restricted cross-origin requests

---

## 📊 **Data Processing Pipeline**

### **Raw Data Processing**
```javascript
// Gender determination based on family relationships
function deriveGender(person, families) {
  const isFather = families.some(family => 
    family.Father_ID === person.Personal_ID
  );
  const isMother = families.some(family => 
    family.Mother_ID === person.Personal_ID
  );
  
  if (isFather) return 'Male';
  if (isMother) return 'Female';
  return 'Unknown';
}

// Age calculation
function deriveAge(person) {
  if (!person.Birth_Year || !person.Death_Year) return null;
  const age = person.Death_Year - person.Birth_Year;
  return age > 130 ? null : age; // Filter out unrealistic ages
}
```

### **Relationship Calculation**
```javascript
// Complex relationship algorithm
class FamilyTree {
  getDirectRelatives(personId) {
    // Get parents, children, spouses
  }
  
  getCollateralRelatives(personId) {
    // Get siblings, cousins, uncles, aunts
  }
  
  calculateRelationship(person1Id, person2Id) {
    // Calculate relationship degree and type
  }
}
```

---

## 🎨 **Visualization Implementation**

### **D3.js Tree Layout**
```javascript
// Hierarchical tree layout
const tree = d3.tree()
  .size([height, width])
  .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

const root = d3.hierarchy(data);
const treeData = tree(root);
```

### **Canvas Rendering**
```javascript
// HTML5 Canvas tree rendering
function drawPersonNode(ctx, x, y, person, type) {
  const gender = getPersonGender(person);
  const colors = getGenderColors(gender);
  
  // Draw node with gender-specific colors
  ctx.fillStyle = colors.fill;
  ctx.strokeStyle = colors.border;
  ctx.fillRect(x, y, width, height);
  
  // Draw person information
  ctx.fillText(person.name, x + 10, y + 20);
}
```

### **Interactive Features**
```javascript
// Node selection and highlighting
function handleNodeClick(event, d) {
  selectedNode = d;
  updateSidePanel(d.data);
  highlightNode(d);
}

// Zoom and pan controls
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", (event) => {
    svg.attr("transform", event.transform);
  });
```

---

## 🚀 **Performance Optimization**

### **Database Optimization**
```sql
-- Query optimization
EXPLAIN SELECT * FROM familytree_people 
WHERE Forenames LIKE '%John%' 
AND Surname LIKE '%Smith%';

-- Index usage
CREATE INDEX idx_name_search ON familytree_people(Forenames, Surname);
```

### **Frontend Optimization**
```javascript
// Lazy loading for large trees
const loadTreeData = async (personId) => {
  if (treeCache.has(personId)) {
    return treeCache.get(personId);
  }
  
  const data = await api.getEnhancedTree(personId);
  treeCache.set(personId, data);
  return data;
};

// Virtual scrolling for large lists
const virtualizedList = computed(() => {
  return items.value.slice(startIndex.value, endIndex.value);
});
```

### **Caching Strategy**
```javascript
// API response caching
const cache = new Map();

const cachedRequest = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
};
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```javascript
// Component testing with Vue Test Utils
import { mount } from '@vue/test-utils';
import FamilyTree from '@/components/FamilyTree.vue';

test('renders family tree correctly', () => {
  const wrapper = mount(FamilyTree, {
    props: { data: mockTreeData }
  });
  
  expect(wrapper.find('.tree-container').exists()).toBe(true);
});
```

### **API Testing**
```javascript
// Backend API testing
const request = require('supertest');
const app = require('../src/server');

test('GET /api/people returns all people', async () => {
  const response = await request(app)
    .get('/api/people')
    .expect(200);
    
  expect(response.body.success).toBe(true);
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

### **Integration Tests**
```javascript
// End-to-end testing
test('user can search and view family tree', async () => {
  await page.goto('http://localhost:5173');
  await page.fill('[data-testid="search-input"]', 'John Smith');
  await page.click('[data-testid="search-button"]');
  await page.click('[data-testid="view-tree-button"]');
  
  expect(await page.isVisible('[data-testid="tree-container"]')).toBe(true);
});
```

---

## 📈 **Monitoring and Logging**

### **Error Logging**
```javascript
// Winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### **Performance Monitoring**
```javascript
// API response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});
```

---

## 🔄 **Deployment Guide**

### **Production Environment**
```bash
# Build frontend
cd 08_FRONTEND
npm run build

# Start backend in production
cd 09_BACKEND
NODE_ENV=production npm start
```

### **Docker Configuration**
```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables**
```env
# Production environment
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-production-secret
```

---

## 🛠️ **Development Workflow**

### **Code Standards**
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **Conventional Commits**: Standardized commit messages

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new visualization mode"
git push origin feature/new-feature

# Create pull request for code review
```

### **Code Review Process**
1. **Automated Checks**: Linting, testing, build verification
2. **Peer Review**: Code review by team members
3. **Testing**: Manual and automated testing
4. **Documentation**: Update relevant documentation

---

## 📚 **API Documentation**

### **OpenAPI Specification**
```yaml
openapi: 3.0.0
info:
  title: CSMPR Family Tree API
  version: 1.0.0
  description: API for family tree visualization system

paths:
  /api/people:
    get:
      summary: Get all people
      responses:
        '200':
          description: List of people
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Person'
```

---

## 🔍 **Debugging Guide**

### **Frontend Debugging**
```javascript
// Vue DevTools
// Install Vue DevTools browser extension
// Use console.log for debugging
console.log('Debug data:', data);

// Vue error handling
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info);
};
```

### **Backend Debugging**
```javascript
// Debug logging
const debug = require('debug')('csmpr:api');

app.get('/api/people', (req, res) => {
  debug('Fetching people data');
  // ... implementation
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 📋 **Troubleshooting Checklist**

### **Common Issues**
- [ ] Database connection failed
- [ ] CORS errors in browser
- [ ] JWT token expired
- [ ] Missing environment variables
- [ ] Port already in use
- [ ] Module not found errors
- [ ] Tree visualization not loading
- [ ] Search functionality not working

### **Debug Steps**
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connection status
4. Review server logs for errors
5. Validate environment configuration
6. Test with sample data
7. Check network connectivity

---

*This technical documentation provides comprehensive information for developers working with the CSMPR Family Tree system. For additional support, refer to the project documentation or contact the development team.*

*Last updated: September 12, 2025*
