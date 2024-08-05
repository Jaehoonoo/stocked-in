// app/page.js
'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import cover from '/assets/background.jpg';

export default function HomePage() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/auth'); // Navigate to the auth page for login/signup
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${cover.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
        Welcome to StockedIn
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 4 }}>
        Manage your inventory efficiently and easily.
      </Typography>
      <Button
        variant="contained"
        sx={{
            backgroundColor: '#0E4F49', // Green color for the button
            '&:hover': {
              backgroundColor: '#0b3f3a', // Darker green for hover effect
            },
          }}
        onClick={handleNavigate}
      >
        Get Started
      </Button>
    </Box>
  );
}
