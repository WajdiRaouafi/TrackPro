import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/pages-trackpro/Dashboard";
import { ScrollToTop } from "./components/common/ScrollToTop";

        {/* Auth */}
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
        {/* Users */}
import UserProfiles from "./pages/UserProfiles";
import UsersList from "./pages/pages-trackpro/Users/UsersList";
import UserEdit from "./pages/pages-trackpro/Users/UserEditForm";
        {/* Projects */}
import ProjectsList from "./pages/pages-trackpro/Projects/ProjectsList";
import ProjectDetail from "./pages/pages-trackpro/Projects/ProjectDetail";
import ProjectEdit from "./pages/pages-trackpro/Projects/ProjectEdit";
import ProjectCreate from "./pages/pages-trackpro/Projects/ProjectCreate";
        {/* Equipements */}
import EquipementsList from "./pages/pages-trackpro/Equipements/EquipementsList";
import EquipementCreate from "./pages/pages-trackpro/Equipements/EquipementCreate";
import EquipementDetail from "./pages/pages-trackpro/Equipements/EquipementDetail";
import EquipementEdit from "./pages/pages-trackpro/Equipements/EquipementEdit";
        {/* Materiaux */}
import MateriauList from "./pages/pages-trackpro/Materiau/CreateMateriauForm"
import CreateMateriauForm from "./pages/pages-trackpro/Materiau/CreateMateriauForm";
import MateriauDetail from "./pages/pages-trackpro/Materiau/MateriauDetail";
import EditMateriauForm from "./pages/pages-trackpro/Materiau/EditMateriauForm";
        {/* Fournisseurs */}
import CreateFournisseurForm from "./pages/pages-trackpro/Fournisseur/CreateFournisseurForm";
import FournisseurList from "./pages/pages-trackpro/Fournisseur/FournisseurList";
import FournisseurDetail from "./pages/pages-trackpro/Fournisseur/FournisseurDetail";
import FournisseurEdit from "./pages/pages-trackpro/Fournisseur/FournisseurEdit";



import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";

// Ajout du composant de route protégée
import PrivateRoute from "./components/PrivateRoute";
export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Routes Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Routes protégées */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

                    {/* Routes Utilisateurs */}
            <Route path="/user/edit/:id" element={<UserEdit />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/users" element={<UsersList />} />

                    {/* Routes Projects */}
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/project/edit/:id" element={<ProjectEdit />} />
            <Route path="/project/new" element={<ProjectCreate />} />

                    {/* Routes Equipements */}
            <Route path="/equipements" element={<EquipementsList />} />
            <Route path="/equipement/new" element={<EquipementCreate />} />
            <Route path="/equipement/:id" element={<EquipementDetail />} />
            <Route path="/equipement/edit/:id" element={<EquipementEdit />} />

                    {/* Routes Materiaux */}
            <Route path="/materiaux" element={<MateriauList />} />
            <Route path="/materiau/new" element={<CreateMateriauForm />} />
            <Route path="/materiau/:id" element={<MateriauDetail />} />
            <Route path="/materiau/edit/:id" element={<EditMateriauForm />} />

                    {/* Routes Fournisseurs */}
            <Route path="/fournisseurs" element={<FournisseurList />} />
            <Route path="/fournisseur/new" element={<CreateFournisseurForm />} />
            <Route path="/fournisseur/:id" element={<FournisseurDetail  />} />
            <Route path="/fournisseur/edit/:id" element={<FournisseurEdit  />} />

                    {/* Autres Routes*/}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
