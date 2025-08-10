// src/components/StatsCards.jsx
import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

/**
 * Affiche une grille de cartes de stats.
 * @param {Array<{label:string, value:number|string, suffix?:string}>} items
 */
export default function StatsCards({ items = [] }) {
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
                {it.value}
                {it.suffix ? ` ${it.suffix}` : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
