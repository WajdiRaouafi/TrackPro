import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getUsers, toggleUserStatus, deleteUser } from "../../api/users";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

const formatRole = (role) => {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "CHEF_PROJET":
      return "Chef de projet";
    case "MEMBRE_EQUIPE":
      return "Membre de l’équipe";
    case "GESTIONNAIRE_RESSOURCES":
      return "Gestionnaire de ressources";
    default:
      return role;
  }
};

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        `${user.nom} ${user.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatRole(user.role).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = () => {
    getUsers()
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch(() => toast.error("Erreur lors du chargement des utilisateurs"));
  };

  const handleEdit = (id) => navigate(`/admin/users/edit/${id}`);

  const handleToggle = async (user) => {
    try {
      await toggleUserStatus(user.id, !user.isActive);
      toast.success(`Utilisateur ${user.email} ${user.isActive ? "désactivé" : "activé"} ✅`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !user.isActive } : u))
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setOpenConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success("Utilisateur supprimé ✅");
      loadUsers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setOpenConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const exportToExcel = () => {
    const data = filteredUsers.map((user) => ({
      Nom: user.nom,
      Prénom: user.prenom,
      Email: user.email,
      Rôle: formatRole(user.role),
      Statut: user.isActive ? "Actif" : "Inactif",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs");

    XLSX.writeFile(workbook, "utilisateurs.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Nom", "Prénom", "Email", "Rôle", "Statut"]],
      body: filteredUsers.map((user) => [
        user.nom,
        user.prenom,
        user.email,
        formatRole(user.role),
        user.isActive ? "Actif" : "Inactif",
      ]),
    });

    doc.save("utilisateurs.pdf");
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Helmet>
              <title>Liste Utilisateurs - TrackPro</title>
            </Helmet>
      <Typography variant="h5" gutterBottom>
        👥 Liste des utilisateurs
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Box display="flex" gap={1}>
          <TextField
            label="Rechercher..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button onClick={exportToExcel} variant="outlined" color="success">
            Export Excel
          </Button>
          <Button onClick={exportToPDF} variant="outlined" color="error">
            Export PDF
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Rôle</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Statut</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "1rem" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={
                            user.photoUrl
                              ? `${BACKEND_URL}${user.photoUrl}`
                              : "https://mdbootstrap.com/img/new/avatars/2.jpg"
                          }
                          alt={user.nom}
                        />
                        <Box>
                          <Typography fontWeight="bold">
                            {user.nom} {user.prenom}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatRole(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? "Actif" : "Inactif"}
                        color={user.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(user.id)} color="warning">
                        <FaEdit />
                      </IconButton>
                      <IconButton onClick={() => confirmDeleteUser(user)} color="error">
                        <FaTrash />
                      </IconButton>
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggle(user)}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 25]}
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Confirmer la suppression
          </Typography>
          <Typography mb={2}>
            Êtes-vous sûr de vouloir supprimer
            <strong> {userToDelete?.nom} {userToDelete?.prenom}</strong> ?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setOpenConfirmDialog(false)} color="inherit">
              Annuler
            </Button>
            <Button onClick={handleDeleteConfirmed} color="error" variant="contained">
              Supprimer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
}
