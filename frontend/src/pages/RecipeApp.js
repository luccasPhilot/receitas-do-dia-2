import React, { useReducer, useEffect, useCallback, useState } from "react";
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    TextField,
    Stack,
    IconButton,
    Tabs,
    Tab,
    Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ReplayIcon from "@mui/icons-material/Replay";
import AddIcon from '@mui/icons-material/Add';
import RecipeCard from "../components/RecipeCard";
import SearchResults from "../components/SearchResults";
import IngredientSearch from "../components/IngredientSearch";
import AddRecipeModal from "../components/AddRecipeModal";
import { recipeReducer, initialState } from "../reducers/recipeReducer";
import { useRecipeHistory } from "../contexts/RecipeContext";
import "../App.css";

function RecipeApp({ onLogout }) {
    const THE_MEAL_DB_API_URL = "https://www.themealdb.com/api/json/v1/1/";
    const BACKEND_AUTH_URL = "http://localhost:3333/auth";
    const BACKEND_RECIPES_URL = "http://localhost:3333/recipes";

    const [state, dispatch] = useReducer(recipeReducer, initialState);
    const { history, addRecipeToHistory } = useRecipeHistory();
    const [allIngredients, setAllIngredients] = useState([]);
    const [searchType, setSearchType] = useState(0);

    const [communitySearchTerm, setCommunitySearchTerm] = useState("");
    const [myRecipesSearchTerm, setMyRecipesSearchTerm] = useState("");
    const [validationError, setValidationError] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${BACKEND_AUTH_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Falha ao fazer logout");
            onLogout();
        } catch (err) {
            console.error("Erro ao fazer logout", err);
        }
    };

    useEffect(() => {
        const fetchAllIngredients = async () => {
            try {
                const response = await fetch(`${THE_MEAL_DB_API_URL}list.php?i=list`);
                const data = await response.json();
                if (data.meals) setAllIngredients(data.meals);
            } catch (error) {
                console.error("Failed to fetch ingredients list", error);
            }
        };
        fetchAllIngredients();
    }, []);

    const fetchRandomRecipe = useCallback(async () => {
        setValidationError("");
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(`${THE_MEAL_DB_API_URL}random.php`);
            if (!response.ok) throw new Error("Network response failed.");
            const data = await response.json();
            if (data.meals) {
                const recipe = data.meals[0];
                dispatch({ type: "FETCH_SUCCESS", payload: [recipe] });
                dispatch({ type: "SELECT_RECIPE", payload: recipe });
                addRecipeToHistory(recipe);
            } else {
                throw new Error("No recipe found.");
            }
        } catch (error) {
            dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
    }, [addRecipeToHistory]);

    useEffect(() => {
        fetchRandomRecipe();
    }, [fetchRandomRecipe]);

    const handleSearchByName = async () => {
        if (!communitySearchTerm.trim()) {
            setValidationError("Please enter a recipe name to search.");
            return;
        }
        setValidationError("");
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(`${THE_MEAL_DB_API_URL}search.php?s=${communitySearchTerm}`);
            if (!response.ok) throw new Error("Network response failed.");
            const data = await response.json();
            if (data.meals) {
                dispatch({ type: "FETCH_SUCCESS", payload: data.meals });
                setCommunitySearchTerm("");
            } else {
                throw new Error(`No recipes found for "${communitySearchTerm}".`);
            }
        } catch (error) {
            dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
    };

    const handleSearchByIngredient = async (ingredient) => {
        if (!ingredient) return;
        const ingredientName = ingredient.strIngredient.replace(/ /g, "_");
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(`${THE_MEAL_DB_API_URL}filter.php?i=${ingredientName}`);
            const data = await response.json();
            if (data.meals) {
                dispatch({ type: "FETCH_SUCCESS", payload: data.meals });
            } else {
                throw new Error(`No recipes found with ingredient "${ingredient.strIngredient}".`);
            }
        } catch (error) {
            dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
    };

    const handleMyRecipesSearch = async () => {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(`${BACKEND_RECIPES_URL}/search?q=${myRecipesSearchTerm}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch your recipes.');

            const data = await response.json();

            const standardizedData = data.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,

                idMeal: recipe.id,
                strMeal: recipe.title,
                strMealThumb: `${process.env.PUBLIC_URL}/recipeDay.png`,

                strInstructions: recipe.instructions,
                strIngredientsText: recipe.ingredients,
            }));

            if (standardizedData.length === 0) {
                dispatch({ type: "FETCH_ERROR", payload: `No recipes found for "${myRecipesSearchTerm}".` });
            } else {
                dispatch({ type: "FETCH_SUCCESS", payload: standardizedData });
            }
        } catch (error) {
            dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
    };

    const handleAddRecipeSubmit = async (formData) => {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await fetch(BACKEND_RECIPES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.errors?.[0]?.msg || 'Failed to create recipe.');
            }

            const newRecipe = await response.json();

            const standardizedRecipe = {
                ...newRecipe,
                idMeal: newRecipe.id,
                strMeal: newRecipe.title,
                strMealThumb: newRecipe.image_url
            };

            dispatch({ type: 'SELECT_RECIPE', payload: standardizedRecipe });
            addRecipeToHistory(standardizedRecipe);
            setMyRecipesSearchTerm('');
        } catch (error) {
            dispatch({ type: "FETCH_ERROR", payload: error.message });
        }
    };

    const handleSelectRecipe = (recipe) => {
        if (recipe.strInstructions) {
            dispatch({ type: 'SELECT_RECIPE', payload: recipe });
            addRecipeToHistory(recipe);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else if (recipe.id && !recipe.idMeal) {
            const standardizedRecipe = {
                ...recipe,
                idMeal: recipe.id,
                strMeal: recipe.title,
                strMealThumb: recipe.image_url,
            };
            dispatch({ type: 'SELECT_RECIPE', payload: standardizedRecipe });
            addRecipeToHistory(standardizedRecipe);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else {
            const fetchFullRecipeDetails = async (recipeId) => {
                dispatch({ type: "FETCH_START" });
                try {
                    const response = await fetch(`${THE_MEAL_DB_API_URL}lookup.php?i=${recipeId}`);
                    const data = await response.json();
                    if (data.meals) {
                        const fullRecipe = data.meals[0];
                        dispatch({ type: "SELECT_RECIPE", payload: fullRecipe });
                        addRecipeToHistory(fullRecipe);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                } catch (error) {
                    dispatch({ type: "FETCH_ERROR", payload: error.message });
                }
            };
            fetchFullRecipeDetails(recipe.idMeal);
        }
    };

    const handleTabChange = (event, newValue) => {
        setSearchType(newValue);
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
        dispatch({ type: 'SELECT_RECIPE', payload: null });
        setValidationError('');
    };

    return (
        <>
            <Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2" gutterBottom sx={{ mb: 0 }}>
                        🍴 Recipe of the Day
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>

                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                    Discover a random recipe or search for your favorite dish!
                </Typography>

                <Box sx={{ width: "100%", mb: 3 }}>
                    <Tabs value={searchType} onChange={handleTabChange} centered>
                        <Tab label="Community (Name)" />
                        <Tab label="Community (Ingredient)" />
                        <Tab label="My Recipes" />
                    </Tabs>
                </Box>

                {searchType === 0 && (
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <TextField
                            label="Search by name..."
                            value={communitySearchTerm}
                            onChange={(e) => setCommunitySearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchByName()}
                            error={!!validationError}
                            helperText={validationError}
                        // ...
                        />
                        <Button onClick={handleSearchByName}>
                            Search
                        </Button>
                    </Stack>
                )}

                {searchType === 1 && (
                    <Box sx={{ mb: 3 }}>
                        <IngredientSearch
                            ingredients={allIngredients}
                            onIngredientSelect={handleSearchByIngredient}
                            disabled={state.loading}
                        />
                    </Box>
                )}

                {searchType === 2 && (
                    <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="flex-start">
                            <TextField
                                label="Search your recipes..."
                                variant="outlined"
                                value={myRecipesSearchTerm}
                                onChange={(e) => setMyRecipesSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMyRecipesSearch()}
                                sx={{ flexGrow: 1, maxWidth: 400 }}
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleMyRecipesSearch}
                                disabled={state.loading}
                                sx={{ height: "56px" }}
                            >
                                Search My Recipes
                            </Button>
                        </Stack>
                        <Divider sx={{ my: 3 }}>OR</Divider>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Add New Recipe
                        </Button>
                    </Box>
                )}

                {searchType !== 2 && (
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={fetchRandomRecipe}
                        disabled={state.loading}
                    >
                        {state.loading ? "Searching..." : "Surprise Me with a Random!"}
                    </Button>
                )}

                <Box sx={{ my: 4 }}>
                    {state.loading && <CircularProgress />}
                    {state.error && <Alert severity="error">{state.error}</Alert>}
                    {!state.loading &&
                        !state.error &&
                        (state.selectedRecipe ? (
                            <RecipeCard recipe={state.selectedRecipe} />
                        ) : (
                            <SearchResults
                                recipes={state.recipes}
                                onSelectRecipe={handleSelectRecipe}
                            />
                        ))}
                </Box>

                {history.length > 0 && (
                    <Box sx={{ mt: 5, textAlign: "left" }}>
                        <Typography variant="h5" gutterBottom>
                            Viewed Recipes History
                        </Typography>
                        <List>
                            {history.map((recipe) => (
                                <ListItem
                                    key={recipe.idMeal}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="re-view"
                                            onClick={() => handleSelectRecipe(recipe)}
                                        >
                                            <ReplayIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={recipe.strMeal}
                                        secondary={recipe.strCategory}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Container>

            <AddRecipeModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddRecipeSubmit}
            />
        </>
    );
}

export default RecipeApp;