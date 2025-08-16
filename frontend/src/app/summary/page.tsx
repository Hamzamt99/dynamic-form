// src/app/summary/page.tsx
'use client';
import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';

const STORAGE_PREFIXES = ['register', 'form.flow'];

function prettyKey(k: string) {
  return k
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/^./, s => s.toUpperCase());
}

function renderValue(v: any) {
  if (v == null) return <Typography color="text.secondary">—</Typography>;
  if (typeof v === 'boolean') return <Chip size="small" label={v ? 'Yes' : 'No'} color={v ? 'success' : 'default'} />;
  if (Array.isArray(v)) {
    if (!v.length) return <Typography color="text.secondary">[]</Typography>;
    return (
      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
        {v.map((x: any, i: number) => (
          <Chip key={i} size="small" label={String(x)} />
        ))}
      </Stack>
    );
  }
  if (typeof v === 'object') {
    const s = JSON.stringify(v, null, 2);
    return (
      <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12 }}>
        {s}
      </Typography>
    );
  }
  return <Typography sx={{ wordBreak: 'break-word' }}>{String(v)}</Typography>;
}

export default function SummaryPage() {
  const router = useRouter();
  const [data, setData] = React.useState<Record<string, any>>({});
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; severity?: 'success' | 'info' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  React.useEffect(() => {
    try {
      const raw =
        localStorage.getItem('register:submission') ||
        localStorage.getItem('form.flow:submission');
      if (raw) setData(JSON.parse(raw));
    } catch {
      setData({});
    }
  }, []);

  const entries = React.useMemo(() => Object.entries(data) as [string, any][], [data]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setToast({ open: true, msg: 'Copied JSON to clipboard', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Copy failed', severity: 'error' });
    }
  };

  const downloadJson = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'submission.json';
      a.click();
      URL.revokeObjectURL(url);
      setToast({ open: true, msg: 'Downloaded submission.json', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Download failed', severity: 'error' });
    }
  };

  const clearAll = () => {
    STORAGE_PREFIXES.forEach(p => {
      localStorage.removeItem(`${p}:submission`);
      localStorage.removeItem(`${p}:values`);
      localStorage.removeItem(`${p}:step`);
    });
    setData({});
    setToast({ open: true, msg: 'Cleared saved data', severity: 'success' });
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* Header / hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.06))',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1.5}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review your answers below. You can copy, download, or print.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Copy JSON">
              <IconButton onClick={copyAll}>
                <ContentCopyRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download JSON">
              <IconButton onClick={downloadJson}>
                <FileDownloadRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={() => window.print()}>
                <PrintRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{ mt: 2 }} />
      </Paper>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {entries.length ? (
          <Table
            size="small"
            aria-label="summary"
            sx={{
              '& tbody tr:nth-of-type(odd)': { backgroundColor: 'action.hover' },
              '& td, & th': { borderBottom: 'none' },
            }}
          >
            <TableBody>
              {entries.map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell sx={{ fontWeight: 700, width: { xs: 140, sm: 220 } }}>
                    {prettyKey(k)}
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>{renderValue(v)}</TableCell>
                  <TableCell align="right" sx={{ width: 72 }}>
                    <Tooltip title="Copy value">
                      <span>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v ?? '')
                              );
                              setToast({ open: true, msg: `Copied "${prettyKey(k)}"`, severity: 'success' });
                            } catch {
                              setToast({ open: true, msg: 'Copy failed', severity: 'error' });
                            }
                          }}
                        >
                          <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ py: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No data to show
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete a workflow first, then you’ll see your answers here.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <Button variant="contained" startIcon={<HomeRoundedIcon />} onClick={() => router.push('/')}>
                Go Home
              </Button>
              <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => router.back()}>
                Back
              </Button>
            </Stack>
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="contained" startIcon={<HomeRoundedIcon />} onClick={() => router.push('/')}>
            Home
          </Button>
          <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => router.back()}>
            Edit Answers
          </Button>
          <Button variant="outlined" color="warning" startIcon={<RestartAltRoundedIcon />} onClick={clearAll}>
            Clear & Restart
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(s => ({ ...s, open: false }))}
          severity={toast.severity ?? 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
