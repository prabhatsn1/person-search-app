"use client";

import "./globals.css";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, Container, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="lg">{children}</Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
