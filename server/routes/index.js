// src/router/index.js (Example using Vue Router)

import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import FacultyDashboard from '../views/FacultyDashboard.vue';
import StudentDashboard from '../views/StudentDashboard.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  // Define explicit routes for each dashboard
  { 
    path: '/faculty/dashboard', 
    name: 'FacultyDashboard', 
    component: FacultyDashboard, 
    meta: { requiresAuth: true, role: 'Faculty' } 
  },
  { 
    path: '/student/dashboard', 
    name: 'StudentDashboard', 
    component: StudentDashboard, 
    meta: { requiresAuth: true, role: 'Student' } 
  },
  // Root path '/' redirects based on role
  { 
    path: '/', 
    redirect: { name: 'DashboardRedirect' } 
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  // Assume user data (with role) is stored in Local Storage after login
  const user = JSON.parse(localStorage.getItem('user')); 

  if (to.meta.requiresAuth && !user) {
    // Redirect to login if a protected route is accessed without a user
    return next('/login');
  }

  // Logic to handle the root path redirection or a general dashboard attempt
  if (to.path === '/' || to.name === 'DashboardRedirect') {
    if (user && user.role === 'Faculty') {
      return next('/faculty/dashboard'); 
    }
    if (user && user.role === 'Student') {
      return next('/student/dashboard');
    }
    // If user exists but role is unknown, or no user, send to login
    return next('/login');
  }

  // Continue to the intended route
  next();
});

export default router;