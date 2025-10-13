import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import StudentDashboard from './pages/StudentDashboard.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import Courses from './pages/Courses.tsx';
import CourseForm from './components/CourseForm.tsx';
import Lessons from './pages/Lessons.tsx';
import LessonForm from './components/LessonForm.tsx';
import Home from './pages/Home.tsx';
import keycloak from './keycloak';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeviceProvider } from './contexts/DeviceContext';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { keycloak } = useKeycloak();
  
  if (keycloak.hasRealmRole('admin')) {
    return <AdminDashboard />;
  } else if (keycloak.hasRealmRole('teacher')) {
    return <TeacherDashboard />;
  } else if (keycloak.hasRealmRole('student')) {
    return <StudentDashboard />;
  } else {
    return <Navigate to="/" replace />;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/student",
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/teacher",
        element: (
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
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
        path: "courses/new",
        element: (
          <ProtectedRoute>
            <CourseForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:id/edit",
        element: (
          <ProtectedRoute>
            <CourseForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/lessons",
        element: (
          <ProtectedRoute>
            <Lessons />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/lessons/new",
        element: (
          <ProtectedRoute>
            <LessonForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/lessons/:lessonId/edit",
        element: (
          <ProtectedRoute>
            <LessonForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <div>Login Page Placeholder</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider authClient={keycloak}>
        <DeviceProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </DeviceProvider>
      </ReactKeycloakProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);