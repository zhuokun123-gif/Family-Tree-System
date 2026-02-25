<template>
  <div class="visitor-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Visitor Dashboard</h1>
        <p>Welcome, {{ username }}! You have read-only access to the family tree system.</p>
        <div class="header-actions">
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- Search Section -->
      <section class="search-section">
        <h2>Search Family Members</h2>
        <div class="search-controls">
          <div class="search-input-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or ID..."
              @input="handleSearchInput"
              @keyup.enter="performSearch"
              class="search-input"
            />
            <button @click="performSearch" class="search-btn" :disabled="isLoading">
              {{ isLoading ? 'Searching...' : 'Search' }}
            </button>
          </div>
        </div>

        <!-- Search Error -->
        <div v-if="searchError" class="search-error">
          <p>{{ searchError }}</p>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <h3>Search Results ({{ searchResults.length }})</h3>
          <div class="results-grid">
            <div
              v-for="person in searchResults"
              :key="person.personalId || person['Personal _ID']"
              class="person-card"
            >
              <div class="person-info">
                <h4>{{ person.fullName || `${person.forenames || person['Forenames']} ${person.surname || person['Surname']}` }}</h4>
                <p><strong>ID:</strong> {{ person.personalId || person['Personal _ID'] }}</p>
                <p><strong>Birth:</strong> {{ person.birthYear || person['Birth_Year'] || 'Unknown' }}</p>
                <p><strong>Death:</strong> {{ person.deathYear || person['Death_Year'] || 'Present' }}</p>
              </div>
              <div class="person-actions">
                <router-link
                  :to="{ name: 'tree', params: { id: person.personalId || person['Personal _ID'] } }"
                  class="view-btn basic"
                >
                  View Basic Tree
                </router-link>
                <router-link
                  :to="{ name: 'enhanced-tree', params: { id: person.personalId || person['Personal _ID'] } }"
                  class="view-btn enhanced"
                >
                  View Enhanced Tree
                </router-link>
              </div>
            </div>
          </div>
        </div>
      
        <div v-else-if="hasSearched" class="no-results">
          <p>No results found for "{{ searchQuery }}"</p>
        </div>
      </section>

      <!-- Quick Stats -->
      <section class="stats-section">
        <h2>Family Tree Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Members</h3>
            <p class="stat-number">{{ stats.totalMembers || 'Loading...' }}</p>
          </div>
          
        </div>
      </section>

      <!-- Access Information -->
      <section class="access-info">
        <h2>Your Access Level</h2>
        <div class="access-card">
          <h3>Visitor Permissions</h3>
          <ul>
            <li>✅ Search family members by name or ID</li>
            <li>✅ View family tree visualizations</li>
            <li>✅ View family relationships and statistics</li>
            <li>❌ Cannot add, edit, or delete data</li>
            <li>❌ Cannot view all individuals list</li>
            <li>❌ Cannot access administrative functions</li>
          </ul>
          <p class="upgrade-note">
            Need full access? Contact an administrator to upgrade your account.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const searchQuery = ref('')
const searchResults = ref([])
const hasSearched = ref(false)
const stats = ref({})
const isLoading = ref(false)
const searchError = ref('')

onMounted(() => {
  // Check if user is logged in as visitor
  const userRole = localStorage.getItem('userRole')
  const storedUsername = localStorage.getItem('username')
  
  if (userRole !== 'visitor') {
    router.push('/admin')
    return
  }
  
  username.value = storedUsername || 'Visitor'
  loadStats()
})

async function loadStats() {
  try {
    const response = await axios.get('/api/enhanced-tree/stats')
    // The API returns stats in a nested structure
    const treeStats = response.data.stats
    stats.value = {
      totalMembers: treeStats.totalMembers,
      livingMembers: treeStats.aliveMembers,
      totalGenerations: treeStats.generations
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
    // Set default values on error
    stats.value = {
      totalMembers: 'Error',
      livingMembers: 'Error', 
      totalGenerations: 'Error'
    }
  }
}

async function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = false
    searchError.value = ''
    return
  }

  isLoading.value = true
  searchError.value = ''

  try {
    const response = await axios.get(`/api/enhanced-tree/search/${encodeURIComponent(searchQuery.value)}`)
    // The API returns results in a nested structure
    searchResults.value = response.data.results || []
    hasSearched.value = true
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
    hasSearched.value = true
    searchError.value = 'Search failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function handleSearchInput() {
  // Clear results and error when input changes
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = false
    searchError.value = ''
  }
}

function logout() {
  localStorage.removeItem('userRole')
  localStorage.removeItem('username')
  router.push('/')
}
</script>

<style scoped>
.visitor-dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.dashboard-header h1 {
  margin: 0 0 16px 0;
  font-size: 36px;
  font-weight: 700;
}

.dashboard-header p {
  margin: 0 0 24px 0;
  font-size: 18px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.search-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-section h2 {
  margin: 0 0 24px 0;
  color: #1f2937;
  font-size: 24px;
}

.search-controls {
  margin-bottom: 24px;
}

.search-input-group {
  display: flex;
  gap: 12px;
  max-width: 500px;
}

.search-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-btn {
  padding: 14px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #2563eb;
}

.search-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.search-results h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.person-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
  transition: all 0.2s;
}

.person-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.person-info h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 18px;
}

.person-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.person-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.view-btn {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.view-btn.basic {
  background: #dbeafe;
  color: #1e40af;
}

.view-btn.basic:hover {
  background: #bfdbfe;
}

.view-btn.enhanced {
  background: #fef3c7;
  color: #92400e;
}

.view-btn.enhanced:hover {
  background: #fde68a;
}

.no-results {
  text-align: center;
  color: #6b7280;
  font-size: 16px;
  padding: 40px;
}

.search-error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
}

.search-error p {
  margin: 0;
  color: #dc2626;
  font-weight: 500;
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-section h2 {
  margin: 0 0 24px 0;
  color: #1f2937;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-card h3 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.stat-number.alive {
  color: #059669;
}

.access-info {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.access-info h2 {
  margin: 0 0 24px 0;
  color: #1f2937;
  font-size: 24px;
}

.access-card {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 24px;
}

.access-card h3 {
  margin: 0 0 16px 0;
  color: #0369a1;
  font-size: 18px;
}

.access-card ul {
  margin: 0 0 20px 0;
  padding-left: 20px;
  color: #374151;
}

.access-card li {
  margin: 8px 0;
  font-size: 16px;
}

.upgrade-note {
  margin: 0;
  color: #6b7280;
  font-style: italic;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 20px;
  }
  
  .dashboard-header h1 {
    font-size: 28px;
  }
  
  .dashboard-content {
    padding: 20px;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
