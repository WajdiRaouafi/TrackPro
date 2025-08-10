import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register } from "../../api/auth";
import { Helmet } from "react-helmet";

// import CustomLogo from './components/CustomLogo'; // remplace SitemarkIcon

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "100dvh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function SignUp(props) {
  const [form, setForm] = React.useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
    salaireJournalier: "",
    role: "CHEF_PROJET",
    photo: null, // 👈 Nouveau champ
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await register(formData); // ⚠️ Doit accepter FormData côté API
      toast.success("✅ Inscription réussie !");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      toast.error(
        "❌ Erreur : " +
          (err.response?.data?.message || "Erreur lors de l’inscription.")
      );
    }
  };

  return (
    <AppTheme {...props}>
      <Helmet>
        <title>Sign Up - TrackPro</title>
      </Helmet>
      <CssBaseline />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          {/* <CustomLogo /> */}
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", mb: 1 }}
          >
            Créer un compte
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel>Nom</FormLabel>
              <TextField
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Prénom</FormLabel>
              <TextField
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Téléphone</FormLabel>
              <TextField
                name="telephone"
                type="tel"
                value={form.telephone}
                onChange={handleChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mot de passe</FormLabel>
              <TextField
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Rôle</FormLabel>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{ padding: "10px", borderRadius: "5px" }}
              >
                <option value="CHEF_PROJET">Chef de Projet</option>
                <option value="MEMBRE_EQUIPE">Membre d'Équipe</option>
                <option value="GESTIONNAIRE_RESSOURCES">
                  Gestionnaire de Ressources
                </option>
              </select>
            </FormControl>

            {form.role === "MEMBRE_EQUIPE" && (
              <FormControl>
                <FormLabel>Salaire journalier</FormLabel>
                <TextField
                  name="salaireJournalier"
                  type="float"
                  value={form.salaireJournalier}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 10 }}
                  required
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Photo de profil</FormLabel>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
              />
            </FormControl>

            <Button type="submit" fullWidth variant="contained">
              S'inscrire
            </Button>
          </Box>

          <Divider>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>
          </Divider>

          <Typography sx={{ textAlign: "center" }}>
            Déjà un compte ?{" "}
            <Link href="/login" variant="body2">
              Se connecter
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
