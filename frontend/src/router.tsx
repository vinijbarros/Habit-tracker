import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { AppLayout } from './layouts/app-layout';
import { HabitsPage } from './pages/habits-page';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { SummaryPage } from './pages/summary-page';
import { TodayPage } from './pages/today-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/habits" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/habits',
            element: <HabitsPage />,
          },
          {
            path: '/today',
            element: <TodayPage />,
          },
          {
            path: '/summary',
            element: <SummaryPage />,
          },
        ],
      },
    ],
  },
]);
