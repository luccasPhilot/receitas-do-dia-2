import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box
} from '@mui/material';

function AddRecipeModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      ingredients,
      instructions,
      image_url: imageUrl || null,
    });
    setTitle('');
    setIngredients('');
    setInstructions('');
    setImageUrl('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Your New Recipe</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Recipe Title"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Ingredients (one per line)"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <TextField
              label="Instructions"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={6}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <TextField
              label="Image URL (Optional)"
              variant="outlined"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save Recipe
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddRecipeModal;