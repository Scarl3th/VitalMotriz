import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CatalogoPage from './pages/catalogo/CatalogoPage';
import ClienteEditarPage from './pages/clientes/ClienteEditarPage';
import ClienteNuevoPage from './pages/clientes/ClienteNuevoPage';
import ClientePage from './pages/clientes/ClientePage';
import ClientesPage from './pages/clientes/ClientesPage';
import RutinaEditarPage from './pages/clientes/RutinaEditarPage';
import RutinaNuevaPage from './pages/clientes/RutinaNuevaPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/clientes" replace /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'clientes/nuevo', element: <ClienteNuevoPage /> },
      { path: 'clientes/:id', element: <ClientePage /> },
      { path: 'clientes/:id/editar', element: <ClienteEditarPage /> },
      { path: 'clientes/:id/rutina/nueva', element: <RutinaNuevaPage /> },
      { path: 'clientes/:id/rutina/editar', element: <RutinaEditarPage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
    ],
  },
]);
