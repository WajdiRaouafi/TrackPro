// src/pages/Materiaux/MateriauList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Dialog, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Typography, Grid, Card, CardContent
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import {
  getAllMateriaux,
  deleteMateriau,
  triggerCommandeAuto,
  getMateriauStats,
} from "../../api/materiaux";

// --- Petit composant StatsCards (inline, autonome) ---
function StatsCards({ items = [] }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {items.map((it, idx) => (
        <Grid item xs={12} sm={6} md={3} lg={2.4} key={idx}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {it.label}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {it.value}{it.suffix ? ` ${it.suffix}` : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const seuilChip = (stock, seuil) => {
  if (Number(stock) <= 0) return { label: "Rupture", color: "error" };
  if (Number(stock) < Number(seuil)) return { label: "Sous seuil", color: "warning" };
  return { label: "OK", color: "success" };
};

export default function MateriauList() {
  const [materiaux, setMateriaux] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [toDelete, setToDelete] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return materiaux.filter(
      (m) =>
        m?.nom?.toLowerCase().includes(q) ||
        m?.type?.toLowerCase().includes(q) ||
        m?.fournisseur?.toLowerCase().includes(q)
    );
  }, [materiaux, search]);

  // Chargement liste + stats backend (si dispo)
  const load = async () => {
    try {
      const [listRes, statRes] = await Promise.all([
        getAllMateriaux(),
        getMateriauStats().catch(() => ({ data: null })), // tolérant si pas implémenté
      ]);
      setMateriaux(listRes.data || []);
      setStats(statRes?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("❌ Erreur lors du chargement des matériaux.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- Stats locales à partir de la liste (fiables même si API renvoie 0) ---
  const computedStats = useMemo(() => {
    const total = materiaux.length;

    let sousSeuil = 0;
    let rupture = 0;
    let commandesEnvoyees = 0;
    let valeurTotaleStock = 0;

    for (const m of materiaux) {
      const stock = Number(m?.stock ?? 0);
      const seuil = Number(m?.seuil ?? 0);
      const coutUnitaire = Number(m?.coutUnitaire ?? 0);

      if (stock <= 0) rupture += 1;
      else if (stock < seuil) sousSeuil += 1;

      if (m?.commandeEnvoyee) commandesEnvoyees += 1;

      valeurTotaleStock += stock * coutUnitaire;
    }

    return {
      total,
      sousSeuil,
      rupture,
      commandesEnvoyees,
      valeurTotaleStock: Number(valeurTotaleStock.toFixed(2)),
    };
  }, [materiaux]);

  // --- Fusion avec les stats backend (si valides), sinon fallback sur local ---
  const mergedStats = useMemo(() => {
    const safeNum = (v) => (v == null || v === "" ? 0 : Number(v));
    if (!stats) return computedStats;

    const merged = {
      total: safeNum(stats.total) || computedStats.total,
      sousSeuil: safeNum(stats.sousSeuil) || computedStats.sousSeuil,
      rupture: safeNum(stats.rupture) || computedStats.rupture,
      commandesEnvoyees:
        safeNum(stats.commandesEnvoyees) || computedStats.commandesEnvoyees,
      valeurTotaleStock:
        safeNum(stats.valeurTotaleStock) || computedStats.valeurTotaleStock,
    };
    return merged;
  }, [stats, computedStats]);

  const askDelete = (m) => {
    setToDelete(m);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMateriau(toDelete.id);
      toast.success("✅ Matériau supprimé !");
      await load();
    } catch {
      toast.error("❌ Erreur lors de la suppression.");
    } finally {
      setOpenConfirm(false);
      setToDelete(null);
    }
  };

  const exportExcel = () => {
    const data = filtered.map((m) => ({
      Nom: m.nom,
      Type: m.type,
      Stock: m.stock,
      Seuil: m.seuil,
      "Coût unitaire ($)": m.coutUnitaire,
      Fournisseur: m.fournisseur || "",
      "Commande envoyée": m.commandeEnvoyee ? "Oui" : "Non",
      "Prochain approvisionnement":
        m.dateProchainApprovisionnement?.substring(0, 10) || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matériaux");
    XLSX.writeFile(wb, "materiaux.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Nom", "Type", "Stock", "Seuil", "Coût", "Four.", "Cmd", "Appro."]],
      body: filtered.map((m) => [
        m.nom,
        m.type,
        m.stock,
        m.seuil,
        m.coutUnitaire,
        m.fournisseur || "-",
        m.commandeEnvoyee ? "Oui" : "Non",
        m.dateProchainApprovisionnement?.substring(0, 10) || "-",
      ]),
    });
    doc.save("materiaux.pdf");
  };

  const onCommandeAuto = async () => {
    try {
      await triggerCommandeAuto();
      toast.success("🚚 Commande automatique vérifiée/exécutée.");
      await load();
    } catch {
      toast.error("❌ Erreur lors de la commande auto.");
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
      <Helmet><title>Liste Matériaux - TrackPro</title></Helmet>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">📦 Matériaux</Typography>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            label="Rechercher (nom/type/fournisseur)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button onClick={() => navigate("/materiau/new")} variant="contained">+ Nouveau</Button>
          <Button onClick={onCommandeAuto} variant="outlined">Commande auto</Button>
          <Button onClick={exportExcel} variant="outlined" color="success">Excel</Button>
          <Button onClick={exportPDF} variant="outlined" color="error">PDF</Button>
        </Box>
      </Box>

      {/* Cartes de statistiques (local + backend fallback) */}
      <StatsCards
        items={[
          { label: "Total matériaux", value: mergedStats.total },
          { label: "Sous seuil", value: mergedStats.sousSeuil },
          { label: "En rupture", value: mergedStats.rupture },
          { label: "Cmd. envoyées", value: mergedStats.commandesEnvoyees },
          { label: "Valeur du stock", value: mergedStats.valeurTotaleStock, suffix: "$" },
        ]}
      />

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Seuil</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Coût unitaire ($)</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell>Commande</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">Aucun matériau.</TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((m) => {
                  const chip = seuilChip(m.stock, m.seuil);
                  return (
                    <TableRow key={m.id} hover>
                      <TableCell
                        sx={{ cursor: "pointer", color: "#1976d2", textDecoration: "underline" }}
                        onClick={() => navigate(`/materiau/${m.id}`)}
                      >
                        {m.nom}
                      </TableCell>
                      <TableCell>{m.type}</TableCell>
                      <TableCell>{m.stock}</TableCell>
                      <TableCell>{m.seuil}</TableCell>
                      <TableCell>
                        <Chip label={chip.label} color={chip.color} size="small" />
                      </TableCell>
                      <TableCell>{m.coutUnitaire}</TableCell>
                      <TableCell>{m.fournisseur || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.commandeEnvoyee ? "Envoyée" : "Non"}
                          color={m.commandeEnvoyee ? "info" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {/* ✅ Correction de route: /materiau/edit/:id */}
                        <IconButton color="warning" onClick={() => navigate(`/materiau/edit/${m.id}`)}>
                          <FaEdit />
                        </IconButton>
                        <IconButton color="error" onClick={() => askDelete(m)}>
                          <FaTrash />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>Confirmer la suppression</Typography>
          <Typography mb={2}>Supprimer <strong>{toDelete?.nom}</strong> ?</Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setOpenConfirm(false)}>Annuler</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
}
