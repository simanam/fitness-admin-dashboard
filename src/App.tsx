// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { ToastProvider } from './hooks/useToast';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import NotFoundPage from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import UnauthorizedPage from './pages/Unauthorized';
import ProfilePage from './pages/Profile';
import ExerciseList from './pages/exercises/ExerciseList';
import ExerciseDetail from './pages/exercises/ExerciseDetail';
import CreateExercisePage from './pages/exercises/CreateExercisePage';
import EditExercisePage from './pages/exercises/EditExercisePage';
import MuscleList from './pages/muscles/MuscleList';
import MuscleDetail from './pages/muscles/MuscleDetail';
import CreateMusclePage from './pages/muscles/CreateMusclePage';
import EditMusclePage from './pages/muscles/EditMusclePage';
import MuscleGroupsManagementPage from './pages/muscles/MuscleGroupsManagementPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <NavigationProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="profile" element={<ProfilePage />} />

                  <Route path="exercises">
                    <Route index element={<ExerciseList />} />
                    <Route path="new" element={<CreateExercisePage />} />
                    <Route path=":id" element={<ExerciseDetail />} />
                    <Route path=":id/edit" element={<EditExercisePage />} />
                  </Route>

                  {/* Muscles */}
                  <Route path="muscles">
                    <Route index element={<MuscleList />} />
                    <Route path="new" element={<CreateMusclePage />} />
                    <Route path=":id/edit" element={<EditMusclePage />} />
                    <Route
                      path="groups"
                      element={<MuscleGroupsManagementPage />}
                    />
                    <Route path=":id" element={<MuscleDetail />} />
                  </Route>

                  {/* Equipment */}
                  <Route path="equipment">
                    <Route
                      index
                      element={<div className="p-4">Equipment List Page</div>}
                    />
                    <Route
                      path="new"
                      element={<div className="p-4">New Equipment Page</div>}
                    />
                    <Route
                      path=":id"
                      element={<div className="p-4">Equipment Detail Page</div>}
                    />
                  </Route>

                  {/* Admin Users */}
                  <Route path="users">
                    <Route
                      index
                      element={<div className="p-4">Admin Users List Page</div>}
                    />
                    <Route
                      path="new"
                      element={<div className="p-4">New Admin User Page</div>}
                    />
                    <Route
                      path=":id"
                      element={
                        <div className="p-4">Admin User Detail Page</div>
                      }
                    />
                  </Route>

                  {/* API Clients */}
                  <Route path="clients">
                    <Route
                      index
                      element={<div className="p-4">API Clients List Page</div>}
                    />
                    <Route
                      path="new"
                      element={<div className="p-4">New API Client Page</div>}
                    />
                    <Route
                      path=":id"
                      element={
                        <div className="p-4">API Client Detail Page</div>
                      }
                    />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NavigationProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
