import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerUser } from "../../api/users";
import { login } from "../../api/auth";

type Role = "CHEF_PROJET" | "MEMBRE_EQUIPE" | "GESTIONNAIRE_RESSOURCES" | "ADMIN";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
    role: "CHEF_PROJET" as Role,
    salaireJournalier: "", // NOTE: string pour l’input; on filtrera avant d’envoyer
    photo: null as File | null,
  });

  /** champs texte + select */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  /** fichier */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((f) => ({ ...f, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validations basiques
    // if (!agree) {
    //   toast.error("Vous devez accepter les CGU/Politique de confidentialité.");
    //   return;
    // }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Email invalide");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Mot de passe trop court (min 6)");
      return;
    }
    if (
      form.role === "MEMBRE_EQUIPE" &&
      (!form.salaireJournalier || Number(form.salaireJournalier) <= 0)
    ) {
      toast.error("Salaire journalier requis pour Membre d'équipe");
      return;
    }

    try {
      setSubmitting(true);

      // ⚠️ Construire FormData sans envoyer de chaînes vides
      const fd = new FormData();
      fd.append("nom", form.nom);
      fd.append("prenom", form.prenom);
      fd.append("telephone", form.telephone);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("role", form.role);

      // n’ajouter salaireJournalier que si MEMBRE_EQUIPE et non vide
      if (
        form.role === "MEMBRE_EQUIPE" &&
        form.salaireJournalier.trim() !== ""
      ) {
        fd.append("salaireJournalier", form.salaireJournalier.trim());
      }

      if (form.photo) {
        fd.append("photo", form.photo);
      }

      await registerUser(fd);

      // auto-login
      await login(form.email, form.password);
      toast.success("✅ Inscription réussie");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Erreur lors de l’inscription.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <ToastContainer position="top-center" theme="colored" />

      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      {/* ⚠️ corrige "w/full" -> "w-full" */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Nom <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Prénom <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>
                  Téléphone <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="telephone"
                  type="tel"
                  value={form.telephone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>
                  Mot de passe <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div>
                <Label>Rôle</Label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 transition bg-transparent border rounded-lg border-gray-200 dark:border-gray-800 dark:text-white/90"
                >
                  <option value="CHEF_PROJET">Chef de Projet</option>
                  <option value="MEMBRE_EQUIPE">Membre d'Équipe</option>
                  <option value="GESTIONNAIRE_RESSOURCES">
                    Gestionnaire de Ressources
                  </option>
                </select>
              </div>

              {form.role === "MEMBRE_EQUIPE" && (
                <div>
                  <Label>Salaire journalier</Label>
                  <Input
                    name="salaireJournalier"
                    type="number"
                    step={0.01}
                    min="0"
                    value={form.salaireJournalier}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <Label>Photo de profil</Label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-white/5 dark:file:text-white/80"
                />
              </div>

              {/* <div className="flex items-center gap-3">
                <Checkbox checked={agree} onChange={setAgree} />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  J’accepte les{" "}
                  <span className="text-gray-800 dark:text-white/90">CGU</span>{" "}
                  et la{" "}
                  <span className="text-gray-800 dark:text-white">
                    Politique de confidentialité
                  </span>
                </p>
              </div> */}

              <div>
                <button
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  disabled={submitting}
                >
                  {submitting ? "Création..." : "S’inscrire"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Déjà un compte ?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
