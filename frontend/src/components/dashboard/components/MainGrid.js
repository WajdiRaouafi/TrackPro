import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';

export default function MainGrid({ stats, projects, navigate }) {
  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  const data = [
  {
    title: 'Utilisateurs',
    value: stats?.total ?? '—',
    interval: 'Total',
    trend: 'up',
    data: [], // ici tu dois au moins passer un tableau vide
  },
  {
    title: 'Utilisateurs actifs',
    value: stats?.actifs ?? '—',
    interval: 'Actifs',
    trend: 'up',
    data: [], // pareil ici
  },
  {
    title: 'Projets',
    value: projects?.length ?? '—',
    interval: 'Total',
    trend: 'neutral',
    data: [], // et ici
  },
];


  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Statistiques */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Vue d'ensemble
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {isAdmin &&
          data.map((card, index) => (
            <Grid key={index} item xs={12} sm={6} lg={3}>
              <StatCard {...card} />
            </Grid>
          ))}

        <Grid item xs={12} sm={6} lg={3}>
          <HighlightedCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <SessionsChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <PageViewsBarChart />
        </Grid>
      </Grid>

      {/* Liste des projets */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Liste des projets
      </Typography>
      <Grid container spacing={2} columns={12}>
        {projects?.map((project) => (
          <Grid key={project.id} item xs={12} sm={6} md={4}>
            <StatCard
              title={project.nom}
              value={project.chefProjet?.email || '—'}
              interval={project.description || ''}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Tableau & autres éléments */}
      <Typography component="h2" variant="h6" sx={{ mt: 4, mb: 2 }}>
        Détails
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid item xs={12} lg={9}>
          <CustomizedDataGrid />
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <CustomizedTreeView />
            <ChartUserByCountry />
          </Stack>
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
