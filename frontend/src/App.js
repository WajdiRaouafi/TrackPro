import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/sign-in/SignIn";
import SignUp from "./components/sign-up/SignUp";
import NotAuthorized from "./components/NotAuthorized";
import CreateUserForm from "./pages/Users/CreateUserForm";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/Project/ProjectDetail";
import UsersList from "./pages/Users/UsersList";
import RequireAdmin from "./components/RequireAdmin";
import ProfilePage from "./pages/Project/ProfilePage";
import ProjectList from "./pages/Project/ProjectList";
import CreateEquipementForm from "./pages/Equipements/CreateEquipementForm";
import EquipementsList from "./pages/Equipements/EquipementsList";
import EquipementsForm from "./pages/Equipements/EquipementForm";
import EquipementsDetail from "./pages/Equipements/EquipementDetail";
import ProjectForm from "./pages/Project/ProjectForm";
import TaskAssignPage from "./pages/Tasks/TaskAssignPage";
import UserEditForm from "./pages/Users/UserEditForm";
import SidebarLayout from "./components/SidebarLayout";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import MateriauList from "./pages/Materiau/MateriauList";
import CreateMateriauForm from "./pages/Materiau/CreateMateriauForm";
import MateriauDetail from "./pages/Materiau/MateriauDetail";
import EditMateriauForm from "./pages/Materiau/EditMateriauForm";

import "react-toastify/dist/ReactToastify.css";
import "rsuite/dist/rsuite.min.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Routes publiques (sans sidebar ni authentification) */}
        <Route path="/register" element={<SignUp />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/login" element={<SignIn />} />

        {/* 🔐 Routes protégées avec sidebar */}
        <Route
          element={
            <PrivateRoute>
              <SidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 🌐 Routes CRUD Equipements */}
          <Route path="/equipements/new" element={<CreateEquipementForm />} />
          <Route path="/equipements" element={<EquipementsList />} />
          <Route path="/equipements/edit/:id" element={<EquipementsForm />} />
          <Route path="/equipements/:id" element={<EquipementsDetail />} />

          {/* 🌐 Routes CRUD Materiaux */}
          <Route path="/materiau" element={<MateriauList />} />
          <Route path="/materiau/new" element={<CreateMateriauForm />} />
          <Route path="/materiau/:id" element={<MateriauDetail />} />
          <Route path="/materiau/edit/:id" element={<EditMateriauForm />} />

          {/* 🌐 Routes CRUD Projets*/}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/tasks" element={<TaskAssignPage />} />

          {/* 🌐 Routes CRUD Utilisateurs*/}
          <Route path="/users/new" element={<CreateUserForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                {" "}
                <UsersList />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/users/edit/:id"
            element={
              <RequireAdmin>
                <UserEditForm />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>

      {/* ✅ Notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
