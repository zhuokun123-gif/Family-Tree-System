import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../views/SearchPage.vue'
import TreePage from '../views/TreePage.vue'
import EnhancedTreePage from '../views/EnhancedTreePage.vue'
import UnifiedTreePage from '../views/UnifiedTreePage.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import FamilyAnalysis from '../views/FamilyAnalysis.vue'
import VisitorDashboard from '../views/VisitorDashboard.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'login', component: AdminLogin },
		{ path: '/search', name: 'search', component: SearchPage },
		{ path: '/tree/:id', name: 'tree', component: TreePage, props: true },
		{ path: '/family-tree/:personId', name: 'family-tree', component: EnhancedTreePage, props: true },
		{ path: '/enhanced-tree/:id', name: 'enhanced-tree', component: EnhancedTreePage, props: true },
		{ path: '/unified-tree/:id', name: 'unified-tree', component: UnifiedTreePage, props: true },
		{ path: '/admin', name: 'admin-login', component: AdminLogin },
		{ path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard },
		{ path: '/admin/family-analysis', name: 'family-analysis', component: FamilyAnalysis },
		{ path: '/visitor/dashboard', name: 'visitor-dashboard', component: VisitorDashboard }
	]
})

// Route guard to check authentication
router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('userRole')
  const isLoginPage = to.name === 'login' || to.name === 'admin-login'
  
  // If user is not logged in and trying to access protected routes
  if (!userRole && !isLoginPage) {
    next('/')
    return
  }
  
  // If user is logged in and trying to access login page, redirect to appropriate dashboard
  if (userRole && isLoginPage) {
    if (userRole === 'admin') {
      next('/admin/dashboard')
    } else if (userRole === 'visitor') {
      next('/visitor/dashboard')
    } else {
      next('/')
    }
    return
  }
  
  next()
})

export default router


