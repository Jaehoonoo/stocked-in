// app/page.js
'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/auth'); // Navigate to the auth page for login/signup
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ marginBottom: 2 }}>
        Welcome to My Inventory App
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 4 }}>
        Manage your inventory efficiently and easily.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigate}
      >
        Get Started
      </Button>
    </Box>
  );
}
