import React, { useState, useEffect } from 'react';
import RecipeApp from './pages/RecipeApp';
import LoginPage from './pages/LoginPage';
import { Box, CircularProgress } from '@mui/material';
import { RecipeProvider } from './contexts/RecipeContext';

const VALIDATE_URL = "http://localhost:3333/auth/validate";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(VALIDATE_URL, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Session not valid');
        }
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <RecipeProvider>
          <RecipeApp onLogout={() => setIsAuthenticated(false)} />
        </RecipeProvider>
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;