import React, { useEffect, useState, useCallback } from "react";
import { getProjects } from "../../api/projects";
import { getUsers } from "../../api/users";
import { useNavigate } from "react-router-dom";
import { Box, Stack, CssBaseline } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AppNavbar from "./components/AppNavbar";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import MainGrid from "./components/MainGrid";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, actifs: 0 });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";
  const isChefProjet = role === "CHEF_PROJET";

  const loadProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      if (isChefProjet) {
        const filtered = res.data.filter(
          (project) => project.chefProjet?.id === user.id
        );
        setProjects(filtered);
      } else {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isChefProjet, user.id]);

  const loadUserStats = async () => {
    try {
      const res = await getUsers();
      const total = res.data.length;
      const actifs = res.data.filter((u) => u.isActive).length;
      setUserStats({ total, actifs });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadProjects();
      if (isAdmin) await loadUserStats();
    };
    init();
  }, [isAdmin, loadProjects]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <MainGrid
              stats={userStats}
              projects={projects}
              navigate={navigate}
            />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
