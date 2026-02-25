<template>
  <div class="enhanced-tree-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h2>Enhanced Family Tree</h2>
          <p>Comprehensive family relationship visualization with direct and collateral relatives</p>
        </div>
        <div class="header-actions">
          <router-link 
            :to="{ name: 'tree', params: { id: id } }" 
            class="family-tree-link"
          >
            <span class="link-icon">🌳</span>
            View Basic Family Tree
          </router-link>
          <router-link 
            :to="{ name: 'unified-tree', params: { id: id } }" 
            class="family-tree-link unified"
          >
            <span class="link-icon">🎯</span>
            View Unified Tree
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="tree-container">
      <EnhancedFamilyTree 
        :rootId="id" 
        :genderDerivation="deriveGender"
        :spouseLookup="findSpouse"
        @select="onSelect" 
        @navigate="onNavigate" 
      />
    </div>
    
    <!-- Additional Tools Panel -->
    <div class="tools-panel" v-if="selectedPerson">
      <h3>Additional Tools</h3>
      
      <!-- Relationship Checker -->
      <div class="tool-section">
        <h4>Check Relationship</h4>
        <div class="relationship-checker">
          <input 
            v-model="relationshipPersonId" 
            placeholder="Enter another person ID"
            class="relationship-input"
          />
          <button @click="checkRelationship" class="check-btn">Check</button>
        </div>
        
        <div v-if="relationshipResult" class="relationship-result">
          <h5>Relationship Result:</h5>
          <p><strong>Type:</strong> {{ relationshipResult.relationship.type }}</p>
          <p><strong>Degree:</strong> {{ relationshipResult.relationship.degree }}°</p>
          <p><strong>Direct:</strong> {{ relationshipResult.relationship.isDirect ? 'Yes' : 'No' }}</p>
          <p><strong>Collateral:</strong> {{ relationshipResult.relationship.isCollateral ? 'Yes' : 'No' }}</p>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="tool-section">
        <h4>Quick Statistics</h4>
        <div class="quick-stats">
          <div class="stat-card">
            <span class="stat-number">{{ selectedPerson.generation }}</span>
            <span class="stat-label">Generation</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ selectedPerson.isAlive ? 'Living' : 'Deceased' }}</span>
            <span class="stat-label">Status</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ selectedPerson.birthYear || 'Unknown' }}</span>
            <span class="stat-label">Birth Year</span>
          </div>
          <div class="stat-card" v-if="selectedPerson.computedGender">
            <span class="stat-number">{{ selectedPerson.computedGender }}</span>
            <span class="stat-label">Computed Gender</span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EnhancedFamilyTree from '../components/EnhancedFamilyTree.vue'
import axios from 'axios'

// Gender derivation utility based on AdminDashboard logic
function deriveGender(person, families = []) {
  const personId = person['Personal _ID'] || person.personalId
  
  if (!personId) return 'Unknown'
  
  // Check if person appears as Father_ID in any family
  const isFather = families.some(family => 
    family.Father_ID === personId || family['Father ID'] === personId
  )
  
  // Check if person appears as Mother_ID in any family
  const isMother = families.some(family => 
    family.Mother_ID === personId || family['Mother ID'] === personId
  )
  
  // Handle conflicting roles
  if (isFather && isMother) {
    console.warn(`Person ${personId} appears as both Father_ID and Mother_ID in families. Using stored Gender field.`)
    const storedGender = person.Gender || person.gender
    return normalizeGender(storedGender)
  }
  
  // Determine gender based on family roles
  if (isFather) return 'Male'
  if (isMother) return 'Female'
  
  // Fall back to stored gender field
  const storedGender = person.Gender || person.gender
  return normalizeGender(storedGender)
}

// Normalize gender values
function normalizeGender(gender) {
  if (!gender) return 'Unknown'
  
  const normalized = gender.toString().toLowerCase().trim()
  
  if (normalized === 'm' || normalized === 'male') return 'Male'
  if (normalized === 'f' || normalized === 'female') return 'Female'
  
  return 'Unknown'
}

// Find spouse information
function findSpouse(personId, families = [], people = []) {
  const personIdStr = personId.toString()
  const spouses = []
  
  // Find from family relationships
  families.forEach(family => {
    const fatherId = family.Father_ID || family['Father ID']
    const motherId = family.Mother_ID || family['Mother ID']
    
    if (fatherId === personIdStr && motherId) {
      const spouse = people.find(p => 
        (p['Personal _ID'] || p.personalId) === motherId
      )
      if (spouse) {
        spouses.push({ ...spouse, role: 'Wife', relationship: 'Wife' })
      }
    }
    
    if (motherId === personIdStr && fatherId) {
      const spouse = people.find(p => 
        (p['Personal _ID'] || p.personalId) === fatherId
      )
      if (spouse) {
        spouses.push({ ...spouse, role: 'Husband', relationship: 'Husband' })
      }
    }
  })
  
  // Find from Spouse_ID field
  const person = people.find(p => 
    (p['Personal _ID'] || p.personalId) === personIdStr
  )
  
  if (person && person.Spouse_ID) {
    const spouse = people.find(p => 
      (p['Personal _ID'] || p.personalId) === person.Spouse_ID
    )
    if (spouse) {
      spouses.push({ ...spouse, role: 'Spouse', relationship: 'Spouse' })
    }
  }
  
  return spouses
}

const route = useRoute()
const router = useRouter()
// Handle both 'id' and 'personId' parameters for backward compatibility
const id = route.params.id || route.params.personId
const selectedPerson = ref(null)
const relationshipPersonId = ref('')
const relationshipResult = ref(null)
const treeData = ref(null)
const genderStats = ref({
  total: 0,
  male: 0,
  female: 0,
  unknown: 0,
  mismatches: []
})

// Process tree data and compute gender statistics
function processTreeData(data) {
  if (!data || !data.people || !data.families) return
  
  const stats = {
    total: 0,
    male: 0,
    female: 0,
    unknown: 0,
    mismatches: []
  }
  
  data.people.forEach(person => {
    const computedGender = deriveGender(person, data.families)
    const rawGender = person.Gender || person.gender || 'Unknown'
    const normalizedRawGender = normalizeGender(rawGender)
    
    stats.total++
    
    if (computedGender === 'Male') stats.male++
    else if (computedGender === 'Female') stats.female++
    else stats.unknown++
    
    
    // Add computed gender to person object
    person.computedGender = computedGender
  })
  
  genderStats.value = stats
  
}

function onSelect(data) {
  selectedPerson.value = data.person
  treeData.value = data
  processTreeData(data)
}

function onNavigate(path) {
  console.log('Navigating to:', path)
  router.push(path)
}

async function checkRelationship() {
  if (!relationshipPersonId.value.trim() || !selectedPerson.value) return
  
  try {
    const { data } = await axios.get(
      `/api/enhanced-tree/relationship/${selectedPerson.value.personalId}/${relationshipPersonId.value.trim()}`
    )
    relationshipResult.value = data
  } catch (error) {
    console.error('Error checking relationship:', error)
    relationshipResult.value = {
      relationship: {
        type: 'Error',
        degree: -1,
        isDirect: false,
        isCollateral: false
      }
    }
  }
}
</script>

<style scoped>
.enhanced-tree-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h2 {
  margin: 0 0 8px 0;
  color: #111827;
}

.header-text p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}


.family-tree-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #059669;
}

.family-tree-link:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.family-tree-link.unified {
  background: #3b82f6;
  border-color: #2563eb;
}

.family-tree-link.unified:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.link-icon {
  font-size: 16px;
}

.tree-container {
  flex: 1;
  display: flex;
  gap: 16px;
}

.tools-panel {
  width: 300px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-left: 16px;
  overflow-y: auto;
}

.tools-panel h3 {
  margin: 0 0 16px 0;
  color: #111827;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
}

.tool-section {
  margin-bottom: 24px;
}

.tool-section h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}

.relationship-checker {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.relationship-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.check-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.check-btn:hover {
  background: #2563eb;
}

.relationship-result {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
}

.relationship-result h5 {
  margin: 0 0 8px 0;
  color: #0369a1;
}

.relationship-result p {
  margin: 4px 0;
  font-size: 14px;
}

.quick-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>
