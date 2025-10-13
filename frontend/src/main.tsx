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
import keycloak from './keycloak';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const getDashboardComponent = (keycloak: any) => {
  if (keycloak.hasRealmRole('admin')) {
    return <AdminDashboard />;
  } else if (keycloak.hasRealmRole('teacher')) {
    return <TeacherDashboard />;
  } else if (keycloak.hasRealmRole('student')) {
    return <StudentDashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading Keycloak...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return <div>Redirecting to login...</div>;
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
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            {getDashboardComponent(keycloak)}
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
        <RouterProvider router={router} />
      </ReactKeycloakProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);