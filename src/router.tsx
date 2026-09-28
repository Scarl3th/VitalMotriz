import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CatalogoPage from './pages/catalogo/CatalogoPage';
import ClienteEditarPage from './pages/clientes/ClienteEditarPage';
import ClienteEvaluacionPage from './pages/clientes/ClienteEvaluacionPage';
import ClienteNuevoPage from './pages/clientes/ClienteNuevoPage';
import ClientePage from './pages/clientes/ClientePage';
import ClienteRutinaPage from './pages/clientes/ClienteRutinaPage';
import ClientesPage from './pages/clientes/ClientesPage';
import EvaluacionEditarPage from './pages/clientes/EvaluacionEditarPage';
import EvaluacionNuevaPage from './pages/clientes/EvaluacionNuevaPage';
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
      { path: 'clientes/:id/rutinas/nueva', element: <RutinaNuevaPage /> },
      { path: 'clientes/:id/rutinas/:rutinaId', element: <ClienteRutinaPage /> },
      { path: 'clientes/:id/rutinas/:rutinaId/editar', element: <RutinaEditarPage /> },
      { path: 'clientes/:id/evaluaciones/nueva', element: <EvaluacionNuevaPage /> },
      { path: 'clientes/:id/evaluaciones/:evaluacionId', element: <ClienteEvaluacionPage /> },
      { path: 'clientes/:id/evaluaciones/:evaluacionId/editar', element: <EvaluacionEditarPage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
    ],
  },
]);
