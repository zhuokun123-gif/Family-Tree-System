<template>
  <div class="family-analysis">
    <!-- Header -->
    <header class="analysis-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <span class="btn-icon">←</span>
          Back to Dashboard
        </button>
        <div class="header-info">
          <h1>Family Analysis</h1>
          <p>Comprehensive insights and statistics about your family tree data</p>
        </div>
      </div>
    </header>

    <!-- Filters Section -->
    <section class="filters-section">
      <div class="filters-container">
        <h3>Filter Data</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Year Range:</label>
            <div class="year-range">
              <input 
                v-model="filters.startYear" 
                type="number" 
                placeholder="Start Year"
                class="year-input"
                @change="applyFilters"
              />
              <span>to</span>
              <input 
                v-model="filters.endYear" 
                type="number" 
                placeholder="End Year"
                class="year-input"
                @change="applyFilters"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label>Family ID:</label>
            <input 
              v-model="filters.familyId" 
              type="text" 
              placeholder="Search Family ID"
              class="filter-input"
              @input="applyFilters"
            />
          </div>
          
          <div class="filter-group">
            <label>Gender:</label>
            <select v-model="filters.gender" @change="applyFilters" class="filter-select">
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="filters.status" @change="applyFilters" class="filter-select">
              <option value="">All Status</option>
              <option value="Living">Living</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>
          
          <div class="filter-group">
            <button @click="resetFilters" class="btn btn-secondary">
              <span class="btn-icon">🔄</span>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading analysis data...</p>
    </div>

    <!-- Charts Grid -->
    <section v-else class="charts-section">
      <div class="charts-grid">
        <!-- Family Size Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Family Size Distribution</h3>
            <p>Number of families grouped by family size (number of children)</p>
          </div>
          <div class="chart-container">
            <BarChart
              v-if="familySizeData.length > 0"
              :data="familySizeData"
              data-key="value"
              label-key="label"
              color="#3b82f6"
            />
            <div v-else class="no-data">
              <p>No family size data available</p>
            </div>
          </div>
        </div>

        <!-- Gender Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Gender Distribution</h3>
            <p>Distribution of Male vs Female in the dataset</p>
          </div>
          <div class="chart-container">
            <PieChart
              v-if="genderData.length > 0"
              :data="genderData"
              data-key="value"
              label-key="name"
            />
            <div v-else class="no-data">
              <p>No gender data available</p>
            </div>
          </div>
        </div>

        <!-- Number of Families by Family Size -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Number of Families by Family Size</h3>
            <p>Histogram showing families grouped by number of children</p>
          </div>
          <div class="chart-container">
            <BarChart
              v-if="familiesBySizeData.length > 0"
              :data="familiesBySizeData"
              data-key="value"
              label-key="label"
              color="#8b5cf6"
            />
            <div v-else class="no-data">
              <p>No family size data available</p>
            </div>
          </div>
        </div>

        <!-- Average Age by Generation -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Average Age by Generation</h3>
            <p>Average age of people by generation level</p>
          </div>
          <div class="chart-container">
            <LineChart
              v-if="generationAgeData.length > 0"
              :data="generationAgeData"
              data-key="value"
              label-key="label"
              color="#10b981"
            />
            <div v-else class="no-data">
              <p>No generation age data available</p>
            </div>
          </div>
        </div>


        <!-- Longevity Analysis -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Longevity Analysis</h3>
            <p>Age distribution histogram</p>
          </div>
          <div class="chart-container">
            <BarChart
              v-if="longevityData.length > 0"
              :data="longevityData"
              data-key="value"
              label-key="label"
              color="#ef4444"
            />
            <div v-else class="no-data">
              <p>No longevity data available</p>
            </div>
          </div>
        </div>

        <!-- Living vs Deceased -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Living vs Deceased Distribution</h3>
            <p>Distribution of living and deceased people</p>
          </div>
          <div class="chart-container">
            <PieChart
              v-if="lifeStatusData.length > 0"
              :data="lifeStatusData"
              data-key="value"
              label-key="name"
            />
            <div v-else class="no-data">
              <p>No life status data available</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Summary Statistics -->
    <section class="summary-section">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">👥</div>
          <div class="summary-content">
            <h3>{{ filteredPeople.length }}</h3>
            <p>Total People</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">🏠</div>
          <div class="summary-content">
            <h3>{{ filteredFamilies.length }}</h3>
            <p>Total Families</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">💚</div>
          <div class="summary-content">
            <h3>{{ livingCount }}</h3>
            <p>Living People</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <h3>{{ averageAge.toFixed(1) }}</h3>
            <p>Average Age</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BarChart from '../components/charts/BarChart.vue'
import LineChart from '../components/charts/LineChart.vue'
import PieChart from '../components/charts/PieChart.vue'

const router = useRouter()

// Data
const people = ref([])
const families = ref([])
const loading = ref(false)

// Filters
const filters = ref({
  startYear: '',
  endYear: '',
  familyId: '',
  status: '', // Living/Deceased
  gender: ''
})

// Computed properties for filtered data
const filteredPeople = computed(() => {
  let filtered = people.value

  if (filters.value.startYear) {
    filtered = filtered.filter(person => 
      person.Birth_Year && person.Birth_Year >= parseInt(filters.value.startYear)
    )
  }

  if (filters.value.endYear) {
    filtered = filtered.filter(person => 
      person.Birth_Year && person.Birth_Year <= parseInt(filters.value.endYear)
    )
  }

  if (filters.value.gender) {
    filtered = filtered.filter(person => person.Gender === filters.value.gender)
  }

  if (filters.value.status) {
    if (filters.value.status === 'Living') {
      filtered = filtered.filter(person => person.Life_Status === 'Living person')
    } else if (filters.value.status === 'Deceased') {
      filtered = filtered.filter(person => person.Life_Status === 'Deceased')
    }
  }

  if (filters.value.familyId) {
    filtered = filtered.filter(person => 
      person.Parents_ID === filters.value.familyId || 
      person.Spouse_ID === filters.value.familyId
    )
  }

  return filtered
})

const filteredFamilies = computed(() => {
  let filtered = families.value

  if (filters.value.familyId) {
    filtered = filtered.filter(family => family.Family_ID === filters.value.familyId)
  }

  return filtered
})

// Chart data
const familySizeData = computed(() => {
  const sizeGroups = {
    '0-2 children': 0,
    '3-5 children': 0,
    '6+ children': 0
  }
  
  filteredFamilies.value.forEach(family => {
    const size = family.Children_Count || 0
    if (size <= 2) {
      sizeGroups['0-2 children']++
    } else if (size <= 5) {
      sizeGroups['3-5 children']++
    } else {
      sizeGroups['6+ children']++
    }
  })

  return Object.entries(sizeGroups)
    .map(([label, value]) => ({
      label,
      value
    }))
    .filter(item => item.value > 0)
})

const genderData = computed(() => {
  const genderCounts = { Male: 0, Female: 0, Unknown: 0 }
  
  filteredPeople.value.forEach(person => {
    const gender = person.Gender || 'Unknown'
    genderCounts[gender] = (genderCounts[gender] || 0) + 1
  })

  return [
    { name: 'Male', value: genderCounts.Male, color: '#3b82f6' },
    { name: 'Female', value: genderCounts.Female, color: '#ec4899' },
    { name: 'Unknown', value: genderCounts.Unknown, color: '#6b7280' }
  ].filter(item => item.value > 0)
})

const familiesBySizeData = computed(() => {
  const sizeGroups = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3-5': 0,
    '6+': 0
  }
  
  filteredFamilies.value.forEach(family => {
    const size = family.Children_Count || 0
    if (size === 0) sizeGroups['0']++
    else if (size === 1) sizeGroups['1']++
    else if (size === 2) sizeGroups['2']++
    else if (size >= 3 && size <= 5) sizeGroups['3-5']++
    else sizeGroups['6+']++
  })

  return Object.entries(sizeGroups)
    .map(([label, value]) => ({
      label,
      value
    }))
    .filter(item => item.value > 0)
})

const generationAgeData = computed(() => {
  const generations = {
    'Grandparents': { totalAge: 0, count: 0 },
    'Parents': { totalAge: 0, count: 0 },
    'Children': { totalAge: 0, count: 0 },
    'Grandchildren': { totalAge: 0, count: 0 }
  }
  
  filteredPeople.value.forEach(person => {
    if (person.Age && person.Age !== 'Unknown') {
      const age = parseInt(person.Age)
      let generation = 'Children' // Default
      
      // Simple generation classification based on age
      if (age >= 60) generation = 'Grandparents'
      else if (age >= 30) generation = 'Parents'
      else if (age >= 18) generation = 'Children'
      else generation = 'Grandchildren'
      
      if (generations[generation]) {
        generations[generation].totalAge += age
        generations[generation].count += 1
      }
    }
  })

  return Object.entries(generations)
    .map(([label, data]) => ({
      label,
      value: data.count > 0 ? Math.round(data.totalAge / data.count) : 0
    }))
    .filter(item => item.value > 0)
})


const longevityData = computed(() => {
  const ageRanges = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
    '100+': 0
  }
  
  filteredPeople.value.forEach(person => {
    if (person.Age && person.Age !== 'Unknown') {
      const age = parseInt(person.Age)
      if (age <= 20) ageRanges['0-20']++
      else if (age <= 40) ageRanges['21-40']++
      else if (age <= 60) ageRanges['41-60']++
      else if (age <= 80) ageRanges['61-80']++
      else if (age <= 100) ageRanges['81-100']++
      else ageRanges['100+']++
    }
  })

  return Object.entries(ageRanges)
    .map(([label, value]) => ({ label, value }))
    .filter(item => item.value > 0)
})

const lifeStatusData = computed(() => {
  const statusCounts = { Living: 0, Deceased: 0, Unknown: 0 }
  
  filteredPeople.value.forEach(person => {
    const status = person.Life_Status || 'Unknown'
    if (status === 'Living person') statusCounts.Living++
    else if (status === 'Deceased') statusCounts.Deceased++
    else statusCounts.Unknown++
  })

  return [
    { name: 'Living', value: statusCounts.Living, color: '#10b981' },
    { name: 'Deceased', value: statusCounts.Deceased, color: '#ef4444' },
    { name: 'Unknown', value: statusCounts.Unknown, color: '#6b7280' }
  ].filter(item => item.value > 0)
})

// Summary statistics
const livingCount = computed(() => {
  return filteredPeople.value.filter(person => person.Life_Status === 'Living person').length
})

const averageAge = computed(() => {
  const peopleWithAge = filteredPeople.value.filter(person => 
    person.Age && person.Age !== 'Unknown'
  )
  
  if (peopleWithAge.length === 0) return 0
  
  const totalAge = peopleWithAge.reduce((sum, person) => sum + parseInt(person.Age), 0)
  return totalAge / peopleWithAge.length
})

// Functions
async function loadData() {
  loading.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: 'Bearer ' + token }
    
    const [peopleRes, familiesRes] = await Promise.all([
      axios.get('/api/enhanced-people', { headers }),
      axios.get('/api/enhanced-families', { headers })
    ])
    
    people.value = peopleRes.data
    families.value = familiesRes.data
    
    console.log('Loaded People:', people.value.length)
    console.log('Loaded Families:', families.value.length)
    
    // Debug chart data
    console.log('Family Size Data:', familySizeData.value)
    console.log('Gender Data:', genderData.value)
    console.log('Families By Size Data:', familiesBySizeData.value)
  } catch (err) {
    console.error('Load data error:', err)
    alert('Failed to load data: ' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  // Filters are reactive, so this function is mainly for UI feedback
  console.log('Filters applied:', filters.value)
}

function resetFilters() {
  filters.value = {
    startYear: '',
    endYear: '',
    familyId: '',
    gender: '',
    status: ''
  }
}

function goBack() {
  router.push('/admin/dashboard')
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.family-analysis {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.analysis-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.header-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.filters-section {
  background: white;
  margin: 2rem auto;
  max-width: 1200px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.filters-container {
  padding: 2rem;
}

.filters-container h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-input, .filter-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100px;
}

.filter-input {
  width: 100%;
}

.year-input:focus, .filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.charts-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.chart-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.chart-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.chart-container {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  width: 100%;
}

.summary-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  font-size: 2rem;
}

.summary-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.summary-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-icon {
  font-size: 0.875rem;
}

/* Loading and No Data States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
