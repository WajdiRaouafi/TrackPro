import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  Divider,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Stack,
  Card as MuiCard,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { Helmet } from "react-helmet";

// import { SitemarkIcon } from './components/CustomIcons';
import { login } from "../../api/auth";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  maxWidth: "450px",
  boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  padding: theme.spacing(2),
  backgroundImage:
    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
}));

export default function SignIn(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    let isValid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      await login(email, password);
      toast.success("✅ Connexion réussie 👋");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      toast.error(
        "❌ Erreur : " +
          (err.response?.data?.message || "Identifiants invalides")
      );
    }
  };

  return (
    <AppTheme {...props}>
      <Helmet>
        <title>Sign In - TrackPro</title>
      </Helmet>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="center">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          {/* <SitemarkIcon /> */}
          <Typography variant="h4" component="h1" align="center">
            Connexion
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailError ? "Email invalide" : ""}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mot de passe</FormLabel>
              <TextField
                required
                fullWidth
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={
                  passwordError
                    ? "Mot de passe trop court (min 6 caractères)"
                    : ""
                }
              />
            </FormControl>

            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Se souvenir de moi"
            />

            <Button type="submit" fullWidth variant="contained">
              Se connecter
            </Button>

            <Link
              component="button"
              onClick={() => setOpen(true)}
              variant="body2"
              align="center"
            >
              Mot de passe oublié ?
            </Link>

            <ForgotPassword open={open} handleClose={() => setOpen(false)} />
          </Box>

          <Divider />

          <Typography sx={{ textAlign: "center" }}>
            Vous n’avez pas de compte ?{" "}
            <Link href="/register" variant="body2">
              Créer un compte
            </Link>
          </Typography>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
