import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/sign-in/SignIn";
// import RegisterPage from './pages/RegisterPage';
import SignUp from "./components/sign-up/SignUp";
// import Dashboard from './pages/dashboard/Dashboard';
import NotAuthorized from "./components/NotAuthorized";
import CreateUserForm from "./pages/Users/CreateUserForm";
// import LoginPage from './pages/LoginPage';
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/Project/ProjectDetail";
import AdminUserPage from "./pages/AdminUserPage";
import RequireAdmin from "./components/RequireAdmin";
import ProfilePage from "./pages/Project/ProfilePage";
import ProjectList from "./pages/Project/ProjectList";
import ProjectForm from "./pages/Project/ProjectForm";
import TaskAssignPage from "./pages/Tasks/TaskAssignPage";
import UserEditForm from "./pages/UserEditForm";
import SidebarLayout from "./components/SidebarLayout";
import PrivateRoute from "./components/PrivateRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "rsuite/dist/rsuite.min.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Routes publiques (sans sidebar ni authentification) */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        <Route path="/register" element={<SignUp />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* <Route path="/login" element={<LoginPage />} /> */}

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
          <Route path="/users/new" element={<CreateUserForm />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/edit/:id" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/tasks" element={<TaskAssignPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <AdminUserPage />
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
