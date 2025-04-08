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
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import CreateEquipmentPage from './pages/equipment/CreateEquipmentPage';
import EditEquipmentPage from './pages/equipment/EditEquipmentPage';
import AdminUserList from './pages/users/AdminUserList';
import AdminUserDetail from './pages/users/AdminUserDetail';
import AdminUserCreate from './pages/users/AdminUserCreate';
import AdminUserEdit from './pages/users/AdminUserEdit';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import ClientForm from './pages/clients/ClientForm';
import JointList from './pages/joints/JointList';
import JointDetail from './pages/joints/JointDetail';
import CreateJointPage from './pages/joints/CreateJointPage';
import EditJointPage from './pages/joints/EditJointPage';
import MovementPatternList from './pages/movement-patterns/MovementPatternList';
import MovementPatternDetail from './pages/movement-patterns/MovementPatternDetail';
import CreateMovementPatternPage from './pages/movement-patterns/CreateMovementPatternPage';
import EditMovementPatternPage from './pages/movement-patterns/EditMovementPatternPage';

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
                    <Route
                      path="groups"
                      element={<MuscleGroupsManagementPage />}
                    />

                    <Route path="new" element={<CreateMusclePage />} />
                    <Route path=":id/edit" element={<EditMusclePage />} />

                    <Route path=":id" element={<MuscleDetail />} />
                    <Route index element={<MuscleList />} />
                  </Route>

                  {/* Equipment */}
                  <Route path="equipment">
                    <Route index element={<EquipmentList />} />
                    <Route path="new" element={<CreateEquipmentPage />} />
                    <Route path=":id" element={<EquipmentDetail />} />
                    <Route path=":id/edit" element={<EditEquipmentPage />} />
                  </Route>

                  {/* Admin Users */}
                  <Route path="users">
                    <Route index element={<AdminUserList />} />
                    <Route path="new" element={<AdminUserCreate />} />
                    <Route path=":id" element={<AdminUserDetail />} />
                    <Route path=":id/edit" element={<AdminUserEdit />} />
                  </Route>

                  {/* API Clients */}
                  <Route path="clients">
                    <Route index element={<ClientList />} />
                    <Route path="new" element={<ClientForm />} />
                    <Route path=":id" element={<ClientDetail />} />
                    <Route path=":id/edit" element={<ClientForm />} />
                  </Route>
                  {/* Joints */}
                  <Route path="joints">
                    <Route index element={<JointList />} />
                    <Route path="new" element={<CreateJointPage />} />
                    <Route path=":id" element={<JointDetail />} />
                    <Route path=":id/edit" element={<EditJointPage />} />
                  </Route>

                  {/* Movement Patterns */}
                  <Route path="movement-patterns">
                    <Route index element={<MovementPatternList />} />
                    <Route path="new" element={<CreateMovementPatternPage />} />
                    <Route path=":id" element={<MovementPatternDetail />} />
                    <Route
                      path=":id/edit"
                      element={<EditMovementPatternPage />}
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
