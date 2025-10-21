import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import Dashboard from './pages/Dashboard.tsx';
import Courses from './pages/Courses.tsx';
import Home from './pages/Home.tsx';
import Callback from './pages/Callback.tsx';
import Lessons from './pages/Lessons.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import StudentDashboard from './pages/StudentDashboard.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import { Auth0ProviderWrapper, ProtectedRoute } from './contexts/Auth0Context';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeviceProvider } from './contexts/DeviceContext';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "callback",
        element: <Callback />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses",
        element: (
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        ),
      },
      {
        path: "lessons",
        element: (
          <ProtectedRoute>
            <Lessons />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "student",
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "teacher",
        element: (
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0ProviderWrapper>
        <DeviceProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </DeviceProvider>
      </Auth0ProviderWrapper>
    </QueryClientProvider>
  </React.StrictMode>,
);