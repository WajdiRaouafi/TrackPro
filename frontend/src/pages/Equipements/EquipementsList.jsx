import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Paper,
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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { getAllEquipements, deleteEquipement } from "../../api/equipements";

const formatStatutLabel = (statut) => {
  switch (statut) {
    case "DISPONIBLE":
      return "Disponible";
    case "EN_PANNE":
      return "En panne";
    case "EN_UTILISATION":
      return "En utilisation";
    case "MAINTENANCE":
      return "Maintenance";
    default:
      return statut;
  }
};

const formatStatutColor = (statut) => {
  switch (statut) {
    case "Disponible":
      return "success";
    case "En panne":
      return "error";
    case "En utilisation":
      return "warning";
    case "Maintenance":
      return "info";
    default:
      return "default";
  }
};

export default function EquipementList() {
  const [equipements, setEquipements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [equipementToDelete, setEquipementToDelete] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const filteredEquipements = equipements.filter((e) =>
    e?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadEquipements();
  }, []);

  const loadEquipements = async () => {
    try {
      const res = await getAllEquipements();
      setEquipements(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors du chargement des équipements.");
    }
  };

  const handleEdit = (id) => navigate(`/equipements/edit/${id}`);

  const confirmDeleteEquipement = (equipement) => {
    setEquipementToDelete(equipement);
    setOpenConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteEquipement(equipementToDelete.id);
      toast.success("✅ Équipement supprimé !");
      loadEquipements();
    } catch {
      toast.error("❌ Erreur lors de la suppression");
    } finally {
      setOpenConfirmDialog(false);
      setEquipementToDelete(null);
    }
  };

  const exportToExcel = () => {
    const data = filteredEquipements.map((e) => ({
      Nom: e.nom,
      Type: e.type,
      "Numéro de Série": e.numeroSerie,
      Statut: formatStatutLabel(e.statut),
      Stock: e.stock,
      "Seuil d'Alerte": e.seuil,
      "Coût/Jour": e.coutParJour,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Équipements");
    XLSX.writeFile(workbook, "equipements.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ["Nom", "Type", "N° Série", "Statut", "Stock", "Seuil", "Coût/Jour"],
      ],
      body: filteredEquipements.map((e) => [
        e.nom,
        e.type,
        e.numeroSerie,
        formatStatutLabel(e.statut),
        e.stock,
        e.seuil,
        e.coutParJour,
      ]),
    });
    doc.save("equipements.pdf");
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Helmet>
        <title>Liste Équipements - TrackPro</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        🛠️ Liste des équipements
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
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Numéro Série</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Seuil</TableCell>
              <TableCell>Coût/Jour</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEquipements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun équipement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipements
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell
                      style={{
                        cursor: "pointer",
                        color: "#1976d2",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate(`/equipements/${e.id}`)}
                    >
                      {e.nom}
                    </TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>{e.numeroSerie}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatutLabel(e.statut)}
                        color={formatStatutColor(e.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{e.stock}</TableCell>
                    <TableCell>{e.seuil}</TableCell>
                    <TableCell>{e.coutParJour}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleEdit(e.id)}
                        color="warning"
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        onClick={() => confirmDeleteEquipement(e)}
                        color="error"
                      >
                        <FaTrash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredEquipements.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Confirmer la suppression
          </Typography>
          <Typography mb={2}>
            Êtes-vous sûr de vouloir supprimer{" "}
            <strong>{equipementToDelete?.nom}</strong> ?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setOpenConfirmDialog(false)}>Annuler</Button>
            <Button
              onClick={handleDeleteConfirmed}
              color="error"
              variant="contained"
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
}
