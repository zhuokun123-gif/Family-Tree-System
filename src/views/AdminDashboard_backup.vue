<template>
  <div class="admin-dashboard">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2>Family Tree</h2>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <span>{{ sidebarCollapsed ? '�? : '�? }}</span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-item active" @click="setActiveSection('dashboard')">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </div>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">People Management</h3>
          <div class="nav-item" :class="{ active: activeSection === 'people' }" @click="setActiveSection('people')">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Person List</span>
          </div>
          <div class="nav-item" :class="{ active: activeSection === 'add-person' }" @click="setActiveSection('add-person')">
            <span class="nav-icon">�?/span>
            <span class="nav-text">Add Person</span>
          </div>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Family Management</h3>
          <div class="nav-item" :class="{ active: activeSection === 'families' }" @click="setActiveSection('families')">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Family List</span>
          </div>
          <div class="nav-item" :class="{ active: activeSection === 'add-family' }" @click="setActiveSection('add-family')">
            <span class="nav-icon">�?/span>
            <span class="nav-text">Add Family</span>
          </div>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Data Management</h3>
          <div class="nav-item" @click="exportData">
            <span class="nav-icon">📤</span>
            <span class="nav-text">Export Data</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">📥</span>
            <span class="nav-text">Import Data</span>
          </div>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">System</h3>
          <div class="nav-item" @click="logout">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">Logout</span>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <h1>Family Tree Management</h1>
          <p>Welcome back, {{ username }}!</p>
        </div>
        <div class="header-right">
          <button @click="refreshData" class="btn btn-secondary">
            <span class="btn-icon">🔄</span>
            Refresh Data
          </button>
        </div>
      </header>

      <!-- Statistics Bar -->
      <section class="stats-bar">
        <div class="stat-card total-families">
          <div class="stat-icon">🏠</div>
          <div class="stat-content">
            <h3>{{ families.length }}</h3>
            <p>Total Families</p>
          </div>
        </div>
        
        <div class="stat-card total-people">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ people.length }}</h3>
            <p>Total People</p>
          </div>
        </div>
        
        <div class="stat-card living-people">
          <div class="stat-icon">💚</div>
          <div class="stat-content">
            <h3>{{ livingPeopleCount }}</h3>
            <p>Living People</p>
          </div>
        </div>
        
        <div class="stat-card deceased-people">
          <div class="stat-icon">💀</div>
          <div class="stat-content">
            <h3>{{ deceasedPeopleCount }}</h3>
            <p>Deceased People</p>
          </div>
        </div>
      </section>

      <!-- Search and Filters -->
      <section class="search-filters-section">
        <div class="search-bar">
          <div class="search-input-group">
            <input
              v-model="memberSearchQuery"
              type="text"
              placeholder="Search by name or ID..."
              @input="performMemberSearch"
              class="search-input"
            />
            <button @click="performMemberSearch" class="btn btn-primary">
              <span class="btn-icon">🔍</span>
              Search
            </button>
          </div>
        </div>
        
        <div class="filters-bar">
          <div class="filter-group">
            <label>Gender:</label>
            <select v-model="genderFilter" class="filter-select">
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="">All</option>
              <option value="Living">Living</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Marital Status:</label>
            <select v-model="maritalFilter" class="filter-select">
              <option value="">All</option>
              <option value="Married">Married</option>
              <option value="Single">Single</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Sort By:</label>
            <select v-model="sortBy" class="filter-select">
              <option value="name">Name</option>
              <option value="birth">Birth Year</option>
              <option value="id">ID</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Content Sections -->
      <div class="content-sections">
        <!-- Dashboard Overview -->
        <section v-if="activeSection === 'dashboard'" class="content-section">
          <div class="section-header">
            <h2>Dashboard Overview</h2>
            <p>Family tree system statistics and quick actions</p>
          </div>
          
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <h3>Quick Actions</h3>
              <div class="action-buttons">
                <button @click="setActiveSection('add-person')" class="btn btn-success">
                  <span class="btn-icon">�?/span>
                  Add Person
                </button>
                <button @click="setActiveSection('add-family')" class="btn btn-success">
                  <span class="btn-icon">🏠</span>
                  Add Family
                </button>
                <button @click="exportData" class="btn btn-warning">
                  <span class="btn-icon">📊</span>
                  Export Data
                </button>
              </div>
            </div>
            
            <div class="dashboard-card">
              <h3>Recent Activity</h3>
              <p>No recent activity to display</p>
            </div>
          </div>
        </section>

        <!-- People Management -->
        <section v-if="activeSection === 'people'" class="content-section">
          <div class="section-header">
            <h2>People Management</h2>
            <div class="section-actions">
              <button @click="setActiveSection('add-person')" class="btn btn-success">
                <span class="btn-icon">�?/span>
                Add Person
              </button>
            </div>
          </div>
          
          <div class="data-table-container">
            <div class="table-header">
              <div class="table-info">
                <span>Showing {{ (peopleCurrentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(peopleCurrentPage * itemsPerPage, filteredPeople.length) }} of {{ filteredPeople.length }} people</span>
              </div>
              <div class="table-actions">
                <button @click="selectAllPeople" class="btn btn-sm btn-secondary">Select All</button>
                <button @click="bulkDeletePeople" class="btn btn-sm btn-danger" :disabled="selectedPeople.length === 0">
                  <span class="btn-icon">🗑�?/span>
                  Delete Selected
                </button>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="checkbox-column">
                      <input type="checkbox" @change="selectAllPeople" :checked="selectedPeople.length === paginatedPeople.length && paginatedPeople.length > 0">
                    </th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Birth Year</th>
                    <th>Death Year</th>
                    <th>Status</th>
                    <th>Marital Status</th>
                    <th class="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="person in paginatedPeople" :key="person['Personal _ID']" class="table-row">
                    <td class="checkbox-column">
                      <input type="checkbox" :value="person['Personal _ID']" v-model="selectedPeople">
                    </td>
                    <td>{{ person['Personal _ID'] }}</td>
                    <td>{{ person['Forenames'] }} {{ person['Surname'] }}</td>
                    <td>
                      <span class="status-badge" :class="getGenderClass(person.Gender)">
                        {{ person.Gender || 'Unknown' }}
                      </span>
                    </td>
                    <td>{{ person['Birth_Year'] || '-' }}</td>
                    <td>{{ person['Death_Year'] || '-' }}</td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(person)">
                        {{ getStatusDisplay(person) }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="getMaritalClass(person.Marital_Status)">
                        {{ person.Marital_Status || 'Unknown' }}
                      </span>
                    </td>
                    <td class="actions-column">
                      <div class="action-buttons">
                        <button @click="editPerson(person)" class="btn btn-sm btn-warning">
                          <span class="btn-icon">✏️</span>
                        </button>
                        <button @click="deletePerson(person)" class="btn btn-sm btn-danger">
                          <span class="btn-icon">🗑�?/span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- People Pagination -->
            <div v-if="peopleTotalPages > 1" class="pagination">
              <div class="pagination-info">
                Page {{ peopleCurrentPage }} of {{ peopleTotalPages }}
              </div>
              <div class="pagination-controls">
                <button @click="prevPeoplePage" :disabled="peopleCurrentPage === 1" class="btn btn-sm btn-secondary">Previous</button>
                <button @click="nextPeoplePage" :disabled="peopleCurrentPage === peopleTotalPages" class="btn btn-sm btn-secondary">Next</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Families Management -->
        <section v-if="activeSection === 'families'" class="content-section">
          <div class="section-header">
            <h2>Families Management</h2>
            <div class="section-actions">
              <button @click="setActiveSection('add-family')" class="btn btn-success">
                <span class="btn-icon">�?/span>
                Add Family
              </button>
            </div>
          </div>
          
          <div class="data-table-container">
            <div class="table-header">
              <div class="table-info">
                <span>Showing {{ (familiesCurrentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(familiesCurrentPage * itemsPerPage, filteredFamilies.length) }} of {{ filteredFamilies.length }} families</span>
              </div>
              <div class="table-actions">
                <button @click="selectAllFamilies" class="btn btn-sm btn-secondary">Select All</button>
                <button @click="bulkDeleteFamilies" class="btn btn-sm btn-danger" :disabled="selectedFamilies.length === 0">
                  <span class="btn-icon">🗑�?/span>
                  Delete Selected
                </button>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="checkbox-column">
                      <input type="checkbox" @change="selectAllFamilies" :checked="selectedFamilies.length === paginatedFamilies.length && paginatedFamilies.length > 0">
                    </th>
                    <th>Family ID</th>
                    <th>Father ID</th>
                    <th>Mother ID</th>
                    <th>Children</th>
                    <th>Marriage Year</th>
                    <th class="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="family in paginatedFamilies" :key="family['Family_ID']" class="table-row">
                    <td class="checkbox-column">
                      <input type="checkbox" :value="family['Family_ID']" v-model="selectedFamilies">
                    </td>
                    <td>{{ family['Family_ID'] }}</td>
                    <td>{{ family['Father_ID'] || '-' }}</td>
                    <td>{{ family['Mother_ID'] || '-' }}</td>
                    <td>{{ formatChildIds(family) }}</td>
                    <td>{{ family['Marriage_Year'] || '-' }}</td>
                    <td class="actions-column">
                      <div class="action-buttons">
                        <button @click="editFamily(family)" class="btn btn-sm btn-warning">
                          <span class="btn-icon">✏️</span>
                        </button>
                        <button @click="deleteFamily(family)" class="btn btn-sm btn-danger">
                          <span class="btn-icon">🗑�?/span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Families Pagination -->
            <div v-if="familiesTotalPages > 1" class="pagination">
              <div class="pagination-info">
                Page {{ familiesCurrentPage }} of {{ familiesTotalPages }}
              </div>
              <div class="pagination-controls">
                <button @click="prevFamiliesPage" :disabled="familiesCurrentPage === 1" class="btn btn-sm btn-secondary">Previous</button>
                <button @click="nextFamiliesPage" :disabled="familiesCurrentPage === familiesTotalPages" class="btn btn-sm btn-secondary">Next</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Add Person Modal -->
        <div v-if="showAddPersonModal" class="modal" @click.self="showAddPersonModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Add New Person</h3>
              <button @click="showAddPersonModal = false" class="close-btn">×</button>
            </div>
            <form @submit.prevent="addPerson">
              <div class="form-group">
                <label>Personal ID:</label>
                <input v-model="newPerson['Personal _ID']" required>
              </div>
              <div class="form-group">
                <label>Forenames:</label>
                <input v-model="newPerson['Forenames']" required>
              </div>
              <div class="form-group">
                <label>Surname:</label>
                <input v-model="newPerson['Surname']" required>
              </div>
              <div class="form-group">
                <label>Birth Year:</label>
                <input v-model="newPerson['Birth_Year']" type="number">
              </div>
              <div class="form-group">
                <label>Death Year:</label>
                <input v-model="newPerson['Death_Year']" type="number">
              </div>
              <div class="form-group">
                <label>Parents Family ID:</label>
                <input v-model="newPerson['Parents_ID']">
              </div>
              <div class="form-group">
                <label>Spouse Family ID:</label>
                <input v-model="newPerson['Spouse_ID']">
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="newPerson['Marriage_Year']" type="number">
              </div>
              <div class="form-actions">
                <button type="button" @click="showAddPersonModal = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-success">Add Person</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Add Family Modal -->
        <div v-if="showAddFamilyModal" class="modal" @click.self="showAddFamilyModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Add New Family</h3>
              <button @click="showAddFamilyModal = false" class="close-btn">×</button>
            </div>
            <form @submit.prevent="addFamily">
              <div class="form-group">
                <label>Family ID:</label>
                <input v-model="newFamily['Family_ID']" required>
              </div>
              <div class="form-group">
                <label>Father ID:</label>
                <input v-model="newFamily['Father_ID']">
              </div>
              <div class="form-group">
                <label>Mother ID:</label>
                <input v-model="newFamily['Mother_ID']">
              </div>
              <div class="form-group">
                <label>Child ID 1:</label>
                <input v-model="newFamily['Child_ID_1']">
              </div>
              <div class="form-group">
                <label>Child ID 2:</label>
                <input v-model="newFamily['Child_ID_2']">
              </div>
              <div class="form-group">
                <label>Child ID 3:</label>
                <input v-model="newFamily['Child_ID_3']">
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="newFamily['Marriage_Year']" type="number">
              </div>
              <div class="form-actions">
                <button type="button" @click="showAddFamilyModal = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-success">Add Family</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
