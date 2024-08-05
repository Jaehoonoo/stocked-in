'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { Box, TextField, Button, Typography, Paper, Container, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom TextField with styled focus
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#c8e6c9', // Default border color
    },
    '&:hover fieldset': {
      borderColor: '#66bb6a', // Border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2e7d32', // Border color when focused
    },
  },
  '& .MuiInputBase-input': {
    color: '#333', // Text color inside the input
    fontSize: '1rem', // Font size of the input text
  },
  '& .MuiFormLabel-root': {
    color: '#666', // Label color
    fontSize: '1rem', // Font size of the label
  },
  '& .MuiFormLabel-root.Mui-focused': {
    color: '#2e7d32', // Label color when focused
  },
}));

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For Sign Up confirmation
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    if (buttonClicked) {
      // Basic email and password validation
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      if (isSignUp && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        setError("Verification email sent. Please check your inbox.");
        // Optionally, redirect the user or show a message to check their email
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          setError("Please verify your email before signing in.");
          await auth.signOut(); // Sign out the user if email is not verified
          return;
        }

        router.push('/inventory');
      }
    } catch (err) {
      console.error('Firebase Auth Error:', err); // Log the entire error object

      if (buttonClicked) {
        // Handle Firebase errors
        if (err.code === 'auth/invalid-email') {
          setError("Invalid email address.");
        } else if (err.code === 'auth/user-not-found') {
          setError("No user found with this email.");
        } else if (err.code === 'auth/wrong-password') {
          setError("Incorrect password.");
        } else if (err.code === 'auth/email-already-in-use') {
          setError("Email is already in use.");
        } else if (err.code === 'auth/weak-password') {
          setError("Password is too weak.");
        } else {
          setError("Incorrect email or password.");
        }
      }
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
      }}
    >
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, width: '100%' }}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 3, color: '#388e3c' }}>
          {isSignUp ? 'Create Your Account' : 'Sign In'}
        </Typography>
        <form onSubmit={handleAuth}>
          <CustomTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <CustomTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          {isSignUp && (
            <CustomTextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          )}
          <Button
            type="submit"
            variant="contained"
            color="success" // Fresh green color
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={() => setButtonClicked(true)} // Set buttonClicked state on click
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          {error && (
            <Typography variant="body2" color="error" align="center" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ marginTop: 2, textAlign: 'center' }}>
            {isSignUp ? (
              <>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component="button" onClick={() => {
                    setIsSignUp(false)
                    setButtonClicked(false)
                    }} sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                    Sign In
                  </Link>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2">
                  New here?{' '}
                  <Link component="button" onClick={() => {
                    setIsSignUp(true)
                    setButtonClicked(false)
                  }} sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                    Sign Up
                  </Link>
                </Typography>
              </>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

