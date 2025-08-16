// src/components/UserProfile/UserMetaCard.tsx
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { updateOwnProfile, uploadUserPhoto } from "../../api/users";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const FALLBACK_AVATAR = "/images/user/owner.jpg";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [me, setMe] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const avatarSrc = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (me?.photoUrl) {
      const rel = me.photoUrl.startsWith("/") ? me.photoUrl : `/${me.photoUrl}`;
      return `${BACKEND_URL}${rel}`;
    }
    return FALLBACK_AVATAR;
  }, [file, me?.photoUrl]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setMe(data);
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("user:updated"));
      } catch {
        // si token absent/expire
        const raw = localStorage.getItem("user");
        setMe(raw ? JSON.parse(raw) : null);
      }
    };
    load();

    const onUpdated = () => {
      const raw = localStorage.getItem("user");
      setMe(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener("user:updated", onUpdated);
    return () => window.removeEventListener("user:updated", onUpdated);
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!me) return;

    if (!me.nom?.trim() || !me.prenom?.trim()) {
      toast.error("Nom et prénom sont requis.");
      return;
    }

    try {
      setSaving(true);

      // 1) Upload de la nouvelle photo si sélectionnée
      let newPhotoUrl: string | undefined;
      if (file) {
        const up = await uploadUserPhoto(file); // -> { photoUrl, user, ... }
        newPhotoUrl = up?.data?.photoUrl;
      }

      // 2) Update de mes infos (nom, prenom, téléphone, photoUrl si changé)
      const fd = new FormData();
      fd.append("nom", me.nom || "");
      fd.append("prenom", me.prenom || "");
      fd.append("telephone", me.telephone || "");
      if (newPhotoUrl) fd.append("photoUrl", newPhotoUrl);

      const res = await updateOwnProfile(fd);

      // 3) Recharger le profil; si /auth/me échoue, fallback sur la réponse d’update
      let fresh: any;
      try {
        fresh = (await api.get("/auth/me")).data;
      } catch {
        fresh = res?.data ?? { ...me, photoUrl: newPhotoUrl ?? me.photoUrl };
      }

      localStorage.setItem("user", JSON.stringify(fresh));
      window.dispatchEvent(new Event("user:updated"));
      setMe(fresh);
      setFile(null);
      toast.success("Profil mis à jour ✅");
      closeModal();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Erreur lors de la mise à jour du profil.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 ring-4 ring-gray-100 dark:ring-gray-800">
              <img
                src={avatarSrc}
                alt="user"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2 text-center xl:text-left">
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {[me?.prenom, me?.nom].filter(Boolean).join(" ") || "—"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                {me?.email || "—"}
              </p>
            </div>

            {/* icônes sociales conservées */}
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875Z" />
                </svg>
              </a>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* Modal édition */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <form
          onSubmit={handleSave}
          className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-2 lg:grid-cols-2">
            <div className="col-span-2">
              <Label>Photo de profil</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/5">
                  <img src={avatarSrc} className="h-full w-full object-cover" />
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white/80 dark:hover:bg-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  Changer…
                </label>
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>First Name</Label>
              <Input
                value={me?.prenom || ""}
                onChange={(e) =>
                  setMe((m: any) => ({ ...m, prenom: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>Last Name</Label>
              <Input
                value={me?.nom || ""}
                onChange={(e) =>
                  setMe((m: any) => ({ ...m, nom: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>Email Address</Label>
              <Input value={me?.email || ""} disabled />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <Label>Phone</Label>
              <Input
                value={me?.telephone || ""}
                onChange={(e) =>
                  setMe((m: any) => ({ ...m, telephone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={closeModal}
            >
              Close
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
