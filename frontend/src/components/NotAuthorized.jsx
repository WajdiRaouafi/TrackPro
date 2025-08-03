import React from "react";
import { Box, Typography, Button, Stack, CssBaseline } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import AppTheme from "../components/shared-theme/AppTheme";
// import AppNavbar from './dashboard/components/AppNavbar';
// import SideMenu from './dashboard/components/SideMenu';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./dashboard/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        {/* <SideMenu />
        <AppNavbar /> */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            p: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          })}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h3" color="error" fontWeight="bold">
              403 - Accès refusé
            </Typography>
            <Typography variant="h6" textAlign="center">
              Vous n'avez pas les autorisations nécessaires pour accéder à cette
              page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/dashboard")}
            >
              Retour à l'accueil
            </Button>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
