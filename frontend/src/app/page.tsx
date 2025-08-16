'use client';

import * as React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Divider,
  Skeleton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

type WorkflowItem = { workflow_id: string; updated_at: string };

function formatRelative(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  const mins = Math.round(diffMs / 60000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(days, 'day');
}

function isRecent(date: Date) {
  const diff = Date.now() - date.getTime();
  return diff < 1000 * 60 * 60 * 24 * 2; // < 48h
}

export default function HomePage() {
  const [items, setItems] = React.useState<WorkflowItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'recent' | 'alpha'>('recent');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // clear register flow cache on home
      localStorage.removeItem('register:submission');
      localStorage.removeItem('register:values');
      localStorage.removeItem('register:step');

      const r = await api.listWorkflows();
      setItems(r.data ?? []);
    } catch (e) {
      setError('Failed to load workflows.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? items.filter((it) => it.workflow_id.toLowerCase().includes(q))
      : [...items];

    if (sortBy === 'alpha') {
      list.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    return list;
  }, [items, query, sortBy]);

  const CountChip = (
    <Chip
      size="small"
      label={`${filtered.length} workflow${filtered.length === 1 ? '' : 's'}`}
      sx={{ fontWeight: 600 }}
    />
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* Hero / Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.06))',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap" rowGap={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Dynamic Workflows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse, preview, and run your workflow configurations.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              placeholder="Search workflows…"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              displayEmpty
            >
              <MenuItem value="recent">Sort: Recent</MenuItem>
              <MenuItem value="alpha">Sort: A–Z</MenuItem>
            </Select>
            <Tooltip title="Grid view">
              <span>
                <IconButton
                  color={view === 'grid' ? 'primary' : 'default'}
                  onClick={() => setView('grid')}
                >
                  <ViewModuleIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="List view">
              <span>
                <IconButton
                  color={view === 'list' ? 'primary' : 'default'}
                  onClick={() => setView('list')}
                >
                  <ViewListIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={load}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />
        {CountChip}
      </Paper>

      {/* Content */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 3, p: 2 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="60%" height={18} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filtered.length ? (
        view === 'grid' ? (
          <Grid container spacing={2}>
            {filtered.map((it) => {
              const d = new Date(it.updated_at);
              const recent = isRecent(d);
              return (
                <Grid key={it.workflow_id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      transition: 'transform .15s ease, box-shadow .15s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                    }}
                  >
                    <CardActionArea component={Link} href={`/${it.workflow_id}`} sx={{ height: '100%' }}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ fontWeight: 700 }}>
                            {it.workflow_id.slice(0, 2).toUpperCase()}
                          </Avatar>
                        }
                        title={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {it.workflow_id}
                            </Typography>
                            {recent && <Chip size="small" color="primary" label="NEW" sx={{ height: 22 }} />}
                          </Stack>
                        }
                        subheader={
                          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <CalendarTodayIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              Updated {formatRelative(d)}
                            </Typography>
                          </Stack>
                        }
                      />
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          Last updated: {d.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((it) => {
              const d = new Date(it.updated_at);
              const recent = isRecent(d);
              return (
                <Card
                  key={it.workflow_id}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: 'transform .15s ease, box-shadow .15s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                  }}
                >
                  <CardActionArea component={Link} href={`/${it.workflow_id}`}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ fontWeight: 700 }}>
                            {it.workflow_id.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {it.workflow_id}
                              </Typography>
                              {recent && <Chip size="small" color="primary" label="NEW" sx={{ height: 22 }} />}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                              <CalendarTodayIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                Updated {formatRelative(d)} • {d.toLocaleString()}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Stack>
        )
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No workflows found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try a different search or refresh to fetch the latest.
          </Typography>
          <IconButton onClick={load}><RefreshIcon /></IconButton>
        </Paper>
      )}
    </Box>
  );
}
