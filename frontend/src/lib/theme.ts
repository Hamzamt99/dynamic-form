import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
  },
  components: {
    MuiContainer: { styleOverrides: { root: { paddingTop: 24, paddingBottom: 24 } } },
  },
});
