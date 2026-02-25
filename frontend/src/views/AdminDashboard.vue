<template>
  <div class="admin-dashboard">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2>Family Tree</h2>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <span>{{ sidebarCollapsed ? '→' : '←' }}</span>
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
            <span class="nav-icon">➕</span>
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
            <span class="nav-icon">➕</span>
            <span class="nav-text">Add Family</span>
          </div>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Data Management</h3>
          <div class="nav-item" @click="exportData">
            <span class="nav-icon">📤</span>
            <span class="nav-text">Export Data</span>
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

      <!-- Analysis Section -->
      <section class="analysis-section">
        <div class="analysis-card">
          <div class="analysis-content">
            <h3>Family Analysis</h3>
            <p>Explore detailed insights and statistics about your family tree data</p>
            <button @click="goToFamilyAnalysis" class="btn btn-primary analysis-btn">
              <span class="btn-icon">📊</span>
              Family Analysis
            </button>
          </div>
        </div>
      </section>

      <!-- Search and Filters (People Management only) -->
      <section v-if="activeSection === 'people'" class="search-filters-section">
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
            <label>Living person:</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="">All</option>
              <option value="Living person">Living person</option>
              <option value="Deceased">Deceased</option>
              <option value="Unknown">Unknown</option>
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
                  <span class="btn-icon">➕</span>
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
                <span class="btn-icon">➕</span>
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
                  <span class="btn-icon">🗑️</span>
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
                    <th>Age</th>
                    <th>Birth Year</th>
                    <th>Death Year</th>
                    <th>Life Status</th>
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
                    <td>
                      <span class="age-display">
                        {{ person.Age && person.Age !== 'Unknown' ? person.Age + ' years' : 'Unknown' }}
                      </span>
                    </td>
                    <td>{{ person['Birth_Year'] || 'Unknown' }}</td>
                    <td>{{ person['Death_Year'] || 'Unknown' }}</td>
                    <td>
                      <span class="status-badge" :class="getLifeStatusClass(person['Life_Status'])">
                        {{ person['Life_Status'] || 'Unknown' }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(person)">
                        {{ person.Status || getStatusDisplay(person) }}
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
                          <span class="btn-icon">🗑️</span>
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
                <span class="btn-icon">➕</span>
                Add Family
              </button>
            </div>
          </div>
          
          <!-- Family Filters -->
          <div class="search-section">
            <div class="search-filters">
              <select v-model="familyStatusFilter" class="filter-select">
                <option value="">All Families</option>
                <option value="with-children">With Children</option>
                <option value="without-children">Without Children</option>
                <option value="married">Married</option>
                <option value="single-parent">Single Parent</option>
              </select>
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
                  <span class="btn-icon">🗑️</span>
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
                    <th>Father</th>
                    <th>Mother</th>
                    <th>Children</th>
                    <th class="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="family in paginatedFamilies" :key="family['Family_ID']" class="table-row">
                    <td class="checkbox-column">
                      <input type="checkbox" :value="family['Family_ID']" v-model="selectedFamilies">
                    </td>
                    <td>{{ family['Family_ID'] }}</td>
                    <td>
                      <div class="person-info">
                        <div class="person-name">{{ family.Father_Name || 'Unknown' }}</div>
                        <div class="person-id">{{ family['Father ID'] || 'Unknown' }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="person-info">
                        <div class="person-name">{{ family.Mother_Name || 'Unknown' }}</div>
                        <div class="person-id">{{ family['Mother_ID'] || 'Unknown' }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="children-info">
                        <div class="children-count">{{ family.Children_Count || 0 }} children</div>
                        <div class="children-names">{{ family.Children_Names && family.Children_Names.length > 0 ? family.Children_Names.join(', ') : 'None' }}</div>
                      </div>
                    </td>
                    <td class="actions-column">
                      <div class="action-buttons">
                        <button @click="editFamily(family)" class="btn btn-sm btn-warning">
                          <span class="btn-icon">✏️</span>
                        </button>
                        <button @click="deleteFamily(family)" class="btn btn-sm btn-danger">
                          <span class="btn-icon">🗑️</span>
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
                <span v-if="personValidationErrors['Personal _ID']" class="validation-error">{{ personValidationErrors['Personal _ID'] }}</span>
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
                <span v-if="personValidationErrors['Birth_Year']" class="validation-error">{{ personValidationErrors['Birth_Year'] }}</span>
              </div>
              <div class="form-group">
                <label>Death Year:</label>
                <input v-model="newPerson['Death_Year']" type="number">
                <span v-if="personValidationErrors['Death_Year']" class="validation-error">{{ personValidationErrors['Death_Year'] }}</span>
              </div>
              <div class="form-group">
                <label>Parents Family ID:</label>
                <input v-model="newPerson['Parents_ID']">
                <span v-if="personValidationErrors['Parents_ID']" class="validation-error">{{ personValidationErrors['Parents_ID'] }}</span>
              </div>
              <div class="form-group">
                <label>Spouse Family ID:</label>
                <input v-model="newPerson['Spouse_ID']">
                <span v-if="personValidationErrors['Spouse_ID']" class="validation-error">{{ personValidationErrors['Spouse_ID'] }}</span>
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="newPerson['Marriage_Year']" type="number">
                <span v-if="personValidationErrors['Marriage_Year']" class="validation-error">{{ personValidationErrors['Marriage_Year'] }}</span>
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
                <span v-if="familyValidationErrors['Father_ID']" class="validation-error">{{ familyValidationErrors['Father_ID'] }}</span>
              </div>
              <div class="form-group">
                <label>Mother ID:</label>
                <input v-model="newFamily['Mother_ID']">
                <span v-if="familyValidationErrors['Mother_ID']" class="validation-error">{{ familyValidationErrors['Mother_ID'] }}</span>
              </div>
              <div class="form-group">
                <label>Child ID 1:</label>
                <input v-model="newFamily['Child_ID_1']">
                <span v-if="familyValidationErrors['Child_ID_1']" class="validation-error">{{ familyValidationErrors['Child_ID_1'] }}</span>
              </div>
              <div class="form-group">
                <label>Child ID 2:</label>
                <input v-model="newFamily['Child_ID_2']">
                <span v-if="familyValidationErrors['Child_ID_2']" class="validation-error">{{ familyValidationErrors['Child_ID_2'] }}</span>
              </div>
              <div class="form-group">
                <label>Child ID 3:</label>
                <input v-model="newFamily['Child_ID_3']">
                <span v-if="familyValidationErrors['Child_ID_3']" class="validation-error">{{ familyValidationErrors['Child_ID_3'] }}</span>
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="newFamily['Marriage_Year_Display']" type="number">
                <span v-if="familyValidationErrors['Marriage_Year_Display']" class="validation-error">{{ familyValidationErrors['Marriage_Year_Display'] }}</span>
              </div>
              <div class="form-actions">
                <button type="button" @click="showAddFamilyModal = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-success">Add Family</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Person Modal -->
        <div v-if="showEditPersonModal" class="modal" @click.self="showEditPersonModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Edit Person</h3>
              <button @click="showEditPersonModal = false" class="close-btn">×</button>
            </div>
            <form @submit.prevent="updatePerson">
              <div class="form-group">
                <label>Personal ID:</label>
                <input v-model="editingPerson['Personal _ID']" readonly>
              </div>
              <div class="form-group">
                <label>Forenames:</label>
                <input v-model="editingPerson['Forenames']" required>
              </div>
              <div class="form-group">
                <label>Surname:</label>
                <input v-model="editingPerson['Surname']" required>
              </div>
              <div class="form-group">
                <label>Birth Year:</label>
                <input v-model="editingPerson['Birth_Year']" type="number">
              </div>
              <div class="form-group">
                <label>Death Year:</label>
                <input v-model="editingPerson['Death_Year']" type="number">
              </div>
              <div class="form-group">
                <label>Parents ID:</label>
                <input v-model="editingPerson['Parents_ID']">
              </div>
              <div class="form-group">
                <label>Spouse ID:</label>
                <input v-model="editingPerson['Spouse_ID']">
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="editingPerson['Marriage_Year']" type="number">
              </div>
              <div class="form-actions">
                <button type="button" @click="showEditPersonModal = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Person</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Family Modal -->
        <div v-if="showEditFamilyModal" class="modal" @click.self="showEditFamilyModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Edit Family</h3>
              <button @click="showEditFamilyModal = false" class="close-btn">×</button>
            </div>
            <form @submit.prevent="updateFamily">
              <div class="form-group">
                <label>Family ID:</label>
                <input v-model="editingFamily['Family_ID']" readonly>
              </div>
              <div class="form-group">
                <label>Father ID:</label>
                <input v-model="editingFamily['Father_ID']">
              </div>
              <div class="form-group">
                <label>Mother ID:</label>
                <input v-model="editingFamily['Mother_ID']">
              </div>
              <div class="form-group">
                <label>Child ID 1:</label>
                <input v-model="editingFamily['Child_ID_1']">
              </div>
              <div class="form-group">
                <label>Child ID 2:</label>
                <input v-model="editingFamily['Child_ID_2']">
              </div>
              <div class="form-group">
                <label>Child ID 3:</label>
                <input v-model="editingFamily['Child_ID_3']">
              </div>
              <div class="form-group">
                <label>Marriage Year:</label>
                <input v-model="editingFamily['Marriage_Year_Display']" type="number">
              </div>
              <div class="form-actions">
                <button type="button" @click="showEditFamilyModal = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Family</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// User info
const username = ref('')

// Data
const people = ref([])
const families = ref([])
const loading = ref(false)
const error = ref('')

// Member search functionality
const memberSearchQuery = ref('')
const memberSearchResults = ref([])
const hasSearched = ref(false)

// Pagination variables
const peopleCurrentPage = ref(1)
const familiesCurrentPage = ref(1)
const itemsPerPage = 50

// UI State
const sidebarCollapsed = ref(false)
const activeSection = ref('dashboard')

// Filter variables
const genderFilter = ref('')
const statusFilter = ref('')
const maritalFilter = ref('')
const sortBy = ref('name')

// Family filter variables
const familyStatusFilter = ref('')

// Selection variables
const selectedPeople = ref([])
const selectedFamilies = ref([])

// Validation state
const personValidationErrors = ref({})
const familyValidationErrors = ref({})

// Form data
const newPerson = ref({
  'Personal _ID': '',
  'Forenames': '',
  'Surname': '',
  'Birth_Year': '',
  'Death_Year': '',
  'Parents_ID': '',
  'Spouse_ID': '',
  'Marriage_Year': ''
})

const newFamily = ref({
  'Family_ID': '',
  'Father_ID': '',
  'Mother_ID': '',
  'Child_ID_1': '',
  'Child_ID_2': '',
  'Child_ID_3': '',
  'Marriage_Year_Display': ''
})

// Modal states
const showAddPersonModal = ref(false)
const showAddFamilyModal = ref(false)
const showEditPersonModal = ref(false)
const showEditFamilyModal = ref(false)

// Editing objects
const editingPerson = ref({
  'Personal _ID': '',
  'Forenames': '',
  'Surname': '',
  'Birth_Year': '',
  'Death_Year': '',
  'Parents_ID': '',
  'Spouse_ID': '',
  'Marriage_Year': ''
})

const editingFamily = ref({
  'Family_ID': '',
  'Father_ID': '',
  'Mother_ID': '',
  'Child_ID_1': '',
  'Child_ID_2': '',
  'Child_ID_3': '',
  'Marriage_Year_Display': ''
})

// Computed properties
const livingPeopleCount = computed(() => {
  return people.value.filter(person => {
    return person['Life_Status'] === 'Living person'
  }).length
})

const deceasedPeopleCount = computed(() => {
  return people.value.filter(person => {
    return person['Life_Status'] === 'Deceased'
  }).length
})

const filteredPeople = computed(() => {
  let filtered = people.value

  // Apply search filter
  if (memberSearchQuery.value) {
    const query = memberSearchQuery.value.toLowerCase()
    filtered = filtered.filter(person => 
      person['Forenames']?.toLowerCase().includes(query) ||
      person['Surname']?.toLowerCase().includes(query) ||
      person['Personal _ID']?.toLowerCase().includes(query)
    )
  }

  // Apply gender filter
  if (genderFilter.value) {
    filtered = filtered.filter(person => person.Gender === genderFilter.value)
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(person => {
      return person['Life_Status'] === statusFilter.value
    })
  }

  // Apply marital status filter
  if (maritalFilter.value) {
    filtered = filtered.filter(person => person.Marital_Status === maritalFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return (a['Forenames'] + ' ' + a['Surname']).localeCompare(b['Forenames'] + ' ' + b['Surname'])
      case 'birth':
        return (b['Birth_Year'] || 0) - (a['Birth_Year'] || 0)
      case 'id':
        return a['Personal _ID'].localeCompare(b['Personal _ID'])
      default:
        return 0
    }
  })

  return filtered
})

const filteredFamilies = computed(() => {
  let filtered = families.value

  // Apply status filter
  if (familyStatusFilter.value) {
    switch (familyStatusFilter.value) {
      case 'with-children':
        filtered = filtered.filter(family => family.Children_Count > 0)
        break
      case 'without-children':
        filtered = filtered.filter(family => family.Children_Count === 0)
        break
      case 'married':
        filtered = filtered.filter(family => family['Father ID'] && family['Mother_ID'])
        break
      case 'single-parent':
        filtered = filtered.filter(family => 
          (family['Father ID'] && !family['Mother_ID']) || 
          (!family['Father ID'] && family['Mother_ID'])
        )
        break
    }
  }

  return filtered
})

const peopleTotalPages = computed(() => {
  return Math.ceil(filteredPeople.value.length / itemsPerPage)
})

const familiesTotalPages = computed(() => {
  return Math.ceil(filteredFamilies.value.length / itemsPerPage)
})

const paginatedPeople = computed(() => {
  const start = (peopleCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPeople.value.slice(start, end)
})

const paginatedFamilies = computed(() => {
  const start = (familiesCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFamilies.value.slice(start, end)
})

// Functions
async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }
    
    const [peopleRes, familiesRes] = await Promise.all([
      axios.get('/api/enhanced-people', { headers }),
      axios.get('/api/enhanced-families', { headers })
    ])
    
    people.value = peopleRes.data
    families.value = familiesRes.data
  } catch (err) {
    error.value = 'Failed to load data: ' + (err.response?.data?.error || err.message)
    console.error('Load data error:', err)
  } finally {
    loading.value = false
  }
}

async function performMemberSearch() {
  if (!memberSearchQuery.value.trim()) {
    memberSearchResults.value = []
    hasSearched.value = false
    return
  }

  try {
    const response = await axios.get(`/api/enhanced-tree/search/${encodeURIComponent(memberSearchQuery.value)}`)
    memberSearchResults.value = response.data
    hasSearched.value = true
  } catch (error) {
    console.error('Search error:', error)
    memberSearchResults.value = []
    hasSearched.value = true
  }
}


function resetNewPerson() {
  newPerson.value = {
    'Personal _ID': '',
    'Forenames': '',
    'Surname': '',
    'Birth_Year': '',
    'Death_Year': '',
    'Parents_ID': '',
    'Spouse_ID': '',
    'Marriage_Year': ''
  }
  personValidationErrors.value = {}
}

function resetNewFamily() {
  newFamily.value = {
    'Family_ID': '',
    'Father_ID': '',
    'Mother_ID': '',
    'Child_ID_1': '',
    'Child_ID_2': '',
    'Child_ID_3': '',
    'Marriage_Year_Display': ''
  }
  familyValidationErrors.value = {}
}

async function refreshData() {
  await loadData()
}

function logout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userRole')
  localStorage.removeItem('username')
  router.push('/')
}

async function exportData() {
  try {
    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }
    
    const [peopleRes, familiesRes] = await Promise.all([
      axios.get('/api/enhanced-people', { headers }),
      axios.get('/api/enhanced-families', { headers })
    ])
    
    const data = {
      people: peopleRes.data,
      families: familiesRes.data,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-tree-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export error:', error)
    alert('Failed to export data: ' + (error.response?.data?.error || error.message))
  }
}

async function editPerson(person) {
  // Load person data into editing form
  editingPerson.value = {
    'Personal _ID': person['Personal _ID'] || '',
    'Forenames': person['Forenames'] || '',
    'Surname': person['Surname'] || '',
    'Birth_Year': person['Birth_Year'] || '',
    'Death_Year': person['Death_Year'] || '',
    'Parents_ID': person['Parents_ID'] || '',
    'Spouse_ID': person['Spouse_ID'] || '',
    'Marriage_Year': person['Marriage_Year'] || ''
  }
  showEditPersonModal.value = true
}

async function updatePerson() {
  try {
    const token = localStorage.getItem('adminToken')
    await axios.put(`/api/admin/people/${editingPerson.value['Personal _ID']}`, editingPerson.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showEditPersonModal.value = false
    await loadData()
    alert('Person updated successfully!')
  } catch (error) {
    console.error('Update person error:', error)
    alert('Failed to update person: ' + (error.response?.data?.error || error.message))
  }
}

async function deletePerson(person) {
  if (confirm(`Are you sure you want to delete ${person['Forenames']} ${person['Surname']}?`)) {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`/api/admin/people/${person['Personal _ID']}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadData()
    } catch (error) {
      console.error('Delete person error:', error)
      alert('Failed to delete person: ' + (error.response?.data?.error || error.message))
    }
  }
}

async function editFamily(family) {
  // Load family data into editing form
  editingFamily.value = {
    'Family_ID': family['Family_ID'] || '',
    'Father_ID': family['Father ID'] || '',
    'Mother_ID': family['Mother_ID'] || '',
    'Child_ID_1': family['Child_ID_1'] || '',
    'Child_ID_2': family['Child_ID_2'] || '',
    'Child_ID_3': family['Child_ID_3'] || '',
    'Marriage_Year_Display': family['Marriage_Year_Display'] || ''
  }
  showEditFamilyModal.value = true
}

async function updateFamily() {
  try {
    const token = localStorage.getItem('adminToken')
    await axios.put(`/api/admin/families/${editingFamily.value['Family_ID']}`, editingFamily.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showEditFamilyModal.value = false
    await loadData()
    alert('Family updated successfully!')
  } catch (error) {
    console.error('Update family error:', error)
    alert('Failed to update family: ' + (error.response?.data?.error || error.message))
  }
}

async function deleteFamily(family) {
  if (confirm(`Are you sure you want to delete family ${family['Family_ID']}?`)) {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`/api/admin/families/${family['Family_ID']}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadData()
    } catch (error) {
      console.error('Delete family error:', error)
      alert('Failed to delete family: ' + (error.response?.data?.error || error.message))
    }
  }
}

// Pagination functions
function prevPeoplePage() {
  if (peopleCurrentPage.value > 1) {
    peopleCurrentPage.value--
  }
}

function nextPeoplePage() {
  if (peopleCurrentPage.value < peopleTotalPages.value) {
    peopleCurrentPage.value++
  }
}

function prevFamiliesPage() {
  if (familiesCurrentPage.value > 1) {
    familiesCurrentPage.value--
  }
}

function nextFamiliesPage() {
  if (familiesCurrentPage.value < familiesTotalPages.value) {
    familiesCurrentPage.value++
  }
}

// Helper functions
function getStatusDisplay(person) {
  if (person.lifeStatus) {
    return person.lifeStatus
  }
  
  if (person.isAlive !== undefined) {
    return person.isAlive ? 'Living' : 'Deceased'
  }
  
  const deathYear = person.deathYear || person['Death_Year']
  if (deathYear) {
    return 'Deceased'
  }
  
  const birthYear = person.birthYear || person['Birth_Year']
  if (birthYear && birthYear < 1900) {
    return 'Deceased'
  }
  
  return 'Unknown'
}

function formatChildIds(family) {
  const childIds = []
  if (family['Child_ID_1']) childIds.push(family['Child_ID_1'])
  if (family['Child_ID_2']) childIds.push(family['Child_ID_2'])
  if (family['Child_ID_3']) childIds.push(family['Child_ID_3'])
  return childIds.length > 0 ? childIds.join(', ') : '-'
}

async function addPerson() {
  if (!validatePerson()) {
    return // Don't submit if validation fails
  }
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.post('/api/admin/people', newPerson.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showAddPersonModal.value = false
    resetNewPerson()
    personValidationErrors.value = {} // Clear validation errors
    await loadData()
  } catch (error) {
    console.error('Failed to add person:', error)
    alert('Failed to add person: ' + (error.response?.data?.error || error.message))
  }
}

async function addFamily() {
  if (!validateFamily()) {
    return // Don't submit if validation fails
  }
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.post('/api/admin/families', newFamily.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showAddFamilyModal.value = false
    resetNewFamily()
    familyValidationErrors.value = {} // Clear validation errors
    await loadData()
  } catch (error) {
    console.error('Failed to add family:', error)
    alert('Failed to add family: ' + (error.response?.data?.error || error.message))
  }
}

// Watch for search query changes to reset pagination
watch(memberSearchQuery, () => {
  peopleCurrentPage.value = 1
})

watch(familyStatusFilter, () => {
  familiesCurrentPage.value = 1
})

// UI Functions
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function setActiveSection(section) {
  activeSection.value = section
  if (section === 'add-person') {
    showAddPersonModal.value = true
  } else if (section === 'add-family') {
    showAddFamilyModal.value = true
  }
}

// Selection functions
function selectAllPeople() {
  if (selectedPeople.value.length === paginatedPeople.value.length) {
    selectedPeople.value = []
  } else {
    selectedPeople.value = paginatedPeople.value.map(p => p['Personal _ID'])
  }
}

function selectAllFamilies() {
  if (selectedFamilies.value.length === paginatedFamilies.value.length) {
    selectedFamilies.value = []
  } else {
    selectedFamilies.value = paginatedFamilies.value.map(f => f['Family_ID'])
  }
}

function bulkDeletePeople() {
  if (selectedPeople.value.length === 0) return
  
  if (confirm(`Are you sure you want to delete ${selectedPeople.value.length} people?`)) {
    // Implement bulk delete logic
    console.log('Bulk delete:', selectedPeople.value)
    selectedPeople.value = []
  }
}

function bulkDeleteFamilies() {
  if (selectedFamilies.value.length === 0) return
  
  if (confirm(`Are you sure you want to delete ${selectedFamilies.value.length} families?`)) {
    // Implement bulk delete logic
    console.log('Bulk delete:', selectedFamilies.value)
    selectedFamilies.value = []
  }
}

// Status badge classes
function getGenderClass(gender) {
  switch (gender) {
    case 'Male': return 'gender-male'
    case 'Female': return 'gender-female'
    default: return 'gender-unknown'
  }
}

function getLifeStatusClass(lifeStatus) {
  switch (lifeStatus) {
    case 'Living person': return 'life-status-living'
    case 'Deceased': return 'life-status-deceased'
    case 'Unknown': return 'life-status-unknown'
    default: return 'life-status-unknown'
  }
}

function getStatusClass(person) {
  const status = getStatusDisplay(person)
  return status.toLowerCase() === 'living' ? 'status-living' : 'status-deceased'
}

function getMaritalClass(maritalStatus) {
  switch (maritalStatus) {
    case 'Married': return 'marital-married'
    case 'Single': return 'marital-single'
    default: return 'marital-unknown'
  }
}

// Navigation functions
function goToFamilyAnalysis() {
  router.push('/admin/family-analysis')
}

// Validation functions
function validatePerson() {
  personValidationErrors.value = {}
  let isValid = true

  // Personal ID validation: must start with "I" followed by digits
  if (!newPerson.value['Personal _ID']) {
    personValidationErrors.value['Personal _ID'] = 'Personal ID is required'
    isValid = false
  } else if (!/^I\d+$/.test(newPerson.value['Personal _ID'])) {
    personValidationErrors.value['Personal _ID'] = 'Personal ID must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Birth Year validation
  if (newPerson.value['Birth_Year'] && !/^\d{4}$/.test(newPerson.value['Birth_Year'].toString())) {
    personValidationErrors.value['Birth_Year'] = 'Birth Year must be a 4-digit number'
    isValid = false
  }

  // Death Year validation
  if (newPerson.value['Death_Year'] && !/^\d{4}$/.test(newPerson.value['Death_Year'].toString())) {
    personValidationErrors.value['Death_Year'] = 'Death Year must be a 4-digit number'
    isValid = false
  }

  // Birth/Death Year interval validation (max 125 years)
  if (newPerson.value['Birth_Year'] && newPerson.value['Death_Year']) {
    const birthYear = parseInt(newPerson.value['Birth_Year'])
    const deathYear = parseInt(newPerson.value['Death_Year'])
    if (deathYear < birthYear) {
      personValidationErrors.value['Death_Year'] = 'Death Year cannot be before Birth Year'
      isValid = false
    } else if (deathYear - birthYear > 125) {
      personValidationErrors.value['Death_Year'] = 'The interval between Birth Year and Death Year cannot exceed 125 years'
      isValid = false
    }
  }

  // Parents Family ID validation
  if (newPerson.value['Parents_ID'] && !/^F\d{1,4}$/.test(newPerson.value['Parents_ID'])) {
    personValidationErrors.value['Parents_ID'] = 'Parents Family ID must start with "F" and have maximum 4 digits (e.g., F1009)'
    isValid = false
  }

  // Spouse Family ID validation
  if (newPerson.value['Spouse_ID'] && !/^F\d{1,4}$/.test(newPerson.value['Spouse_ID'])) {
    personValidationErrors.value['Spouse_ID'] = 'Spouse Family ID must start with "F" and have maximum 4 digits (e.g., F1009)'
    isValid = false
  }

  // Marriage Year validation
  if (newPerson.value['Marriage_Year'] && !/^\d{4}$/.test(newPerson.value['Marriage_Year'].toString())) {
    personValidationErrors.value['Marriage_Year'] = 'Marriage Year must be a 4-digit number'
    isValid = false
  }

  return isValid
}

function validateFamily() {
  familyValidationErrors.value = {}
  let isValid = true

  // Father ID validation
  if (newFamily.value['Father_ID'] && !/^I\d+$/.test(newFamily.value['Father_ID'])) {
    familyValidationErrors.value['Father_ID'] = 'Father ID must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Mother ID validation
  if (newFamily.value['Mother_ID'] && !/^I\d+$/.test(newFamily.value['Mother_ID'])) {
    familyValidationErrors.value['Mother_ID'] = 'Mother ID must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Child ID 1 validation
  if (newFamily.value['Child_ID_1'] && !/^I\d+$/.test(newFamily.value['Child_ID_1'])) {
    familyValidationErrors.value['Child_ID_1'] = 'Child ID 1 must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Child ID 2 validation
  if (newFamily.value['Child_ID_2'] && !/^I\d+$/.test(newFamily.value['Child_ID_2'])) {
    familyValidationErrors.value['Child_ID_2'] = 'Child ID 2 must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Child ID 3 validation
  if (newFamily.value['Child_ID_3'] && !/^I\d+$/.test(newFamily.value['Child_ID_3'])) {
    familyValidationErrors.value['Child_ID_3'] = 'Child ID 3 must start with "I" followed by digits (e.g., I122608274953)'
    isValid = false
  }

  // Marriage Year validation
  if (newFamily.value['Marriage_Year_Display'] && !/^\d{4}$/.test(newFamily.value['Marriage_Year_Display'].toString())) {
    familyValidationErrors.value['Marriage_Year_Display'] = 'Marriage Year must be a 4-digit number'
    isValid = false
  }

  return isValid
}

// Lifecycle
onMounted(async () => {
  username.value = localStorage.getItem('username') || 'Admin'
  await loadData()
})
</script>

<style scoped>
/* Modern Admin Dashboard Styles */
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .sidebar-header h2 {
  opacity: 0;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background: #f1f5f9;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 20px 12px;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-section-title {
  opacity: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8fafc;
  border-left-color: #3b82f6;
}

.nav-item.active {
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #1d4ed8;
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  min-width: 20px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
}

/* Main Content */
.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
  margin-left: 0;
}

.main-content.sidebar-collapsed {
  margin-left: -210px;
}

/* Top Header */
.top-header {
  background: #ffffff;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.header-left p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Statistics Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding: 32px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Search and Filters */
.search-filters-section {
  background: #ffffff;
  margin: 0 32px 24px;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.search-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input-group {
  display: flex;
  gap: 12px;
  max-width: 500px;
  flex: 1;
}

.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 150px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filters-bar {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  min-width: 120px;
}

/* Content Sections */
.content-sections {
  padding: 0 32px 32px;
}

.content-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

.dashboard-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.dashboard-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* Data Table */
.data-table-container {
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-info {
  color: #64748b;
  font-size: 14px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.data-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.table-row:hover {
  background: #f8fafc;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.actions-column {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Status Badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gender-male {
  background: #dbeafe;
  color: #1e40af;
}

.gender-female {
  background: #fce7f3;
  color: #be185d;
}

.gender-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.status-living {
  background: #dcfce7;
  color: #166534;
}

.status-deceased {
  background: #fee2e2;
  color: #dc2626;
}

.marital-married {
  background: #fef3c7;
  color: #d97706;
}

.marital-single {
  background: #e0e7ff;
  color: #3730a3;
}

.marital-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* Life Status styles */
.life-status-living {
  background: #dcfce7;
  color: #166534;
}

.life-status-deceased {
  background: #fee2e2;
  color: #dc2626;
}

.life-status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* Analysis section styles */
.analysis-section {
  margin: 2rem 0;
}

.analysis-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.analysis-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.analysis-content p {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.analysis-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.analysis-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Enhanced display styles */
.age-display {
  font-weight: 500;
  color: #374151;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.person-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
}

.person-id {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.children-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.children-count {
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
}

.children-names {
  font-size: 12px;
  color: #6b7280;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: #ffffff;
}

.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: #ffffff;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #64748b;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Validation Error Styles */
.validation-error {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.form-group input:invalid {
  border-color: #dc2626;
}

.form-group input:valid {
  border-color: #10b981;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar:not(.collapsed) {
    left: 0;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .stats-bar {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  
  .search-filters-section {
    margin: 0 16px 16px;
    padding: 16px;
  }
  
  .content-sections {
    padding: 0 16px 16px;
  }
  
  .filters-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
