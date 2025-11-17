// src/components/RecipeCard.jsx

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const getIngredients = (recipe) => {
  const ingredients = [];

  if (recipe.strIngredient1) {
    // Lógica ANTIGA (TheMealDB)
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
  } else if (recipe.strIngredientsText) {
    // Lógica NOVA (Nosso Backend)
    // Assumimos que o texto de ingredientes é separado por linha
    return recipe.strIngredientsText.split('\n')
                                    .filter(line => line.trim() !== '');
  }

  return ingredients;
};

function RecipeCard({ recipe }) {
  if (!recipe) {
    return null;
  }

  const ingredients = getIngredients(recipe);

  return (
    // Usamos a sombra que definimos no nosso tema
    <Card sx={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)' }}>
      <CardMedia
        component="img"
        height="350"
        // 'recipe.strMealThumb' agora será '/recipeDay.png' se a receita for sua
        image={recipe.strMealThumb}
        alt={recipe.strMeal}
      />
      <CardContent sx={{ p: 4 }}>
        <Typography gutterBottom variant="h4" component="div" sx={{ mb: 2 }}>
          {recipe.strMeal}
        </Typography>

        {/* Mostra categoria e origem APENAS se for da TheMealDB */}
        {recipe.strCategory && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <strong>Category:</strong> {recipe.strCategory} | <strong>Origin:</strong> {recipe.strArea}
          </Typography>
        )}
        
        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Ingredients
          </Typography>
          <List dense>
            {ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <RestaurantMenuIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={ingredient} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {recipe.strInstructions}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default RecipeCard;