import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import Dashboard from './pages/Dashboard.tsx';
import Courses from './pages/Courses.tsx';
import Home from './pages/Home.tsx';
import Callback from './pages/Callback.tsx';
import { Auth0ProviderWrapper, ProtectedRoute } from './contexts/Auth0Context';
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0ProviderWrapper>
        <DeviceProvider>
          <RouterProvider router={router} />
        </DeviceProvider>
      </Auth0ProviderWrapper>
    </QueryClientProvider>
  </React.StrictMode>,
);