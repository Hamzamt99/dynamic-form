'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { theme } from '@/lib/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="md">{children}</Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
