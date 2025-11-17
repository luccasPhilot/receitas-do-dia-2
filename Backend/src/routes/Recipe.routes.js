import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { protectRoute } from '../middleware/authMiddleware.js';
import { Recipe } from '../models/RecipeModel.js';
import cache from '../config/cache.js';

const router = Router();

const recipeValidationRules = [
    body('title').notEmpty().withMessage('O título é obrigatório.').trim().escape(),
    body('ingredients').notEmpty().withMessage('Os ingredientes são obrigatórios.').trim().escape(),
    body('instructions').notEmpty().withMessage('As instruções são obrigatórias.').trim().escape(),
];

const searchValidationRules = [
    query('q').optional().trim().escape(),
];

router.get(
    '/search',
    protectRoute,
    searchValidationRules,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const searchTerm = req.query.q || '';

            const cacheKey = `user_${userId}_search_${searchTerm}`;
            const cachedResults = cache.get(cacheKey);

            if (cachedResults) {
                console.log('CACHE: Retornando dados do cache');
                return res.status(200).json(cachedResults);
            }

            console.log('DB: Buscando dados do banco (Sequelize)');

            const recipes = await Recipe.findAll({
                where: {
                    user_id: userId,
                    title: {
                        [Op.iLike]: `%${searchTerm}%`,
                    },
                },
                order: [['created_at', 'DESC']],
            });

            cache.set(cacheKey, recipes);
            res.status(200).json(recipes);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro no servidor ao buscar receitas.' });
        }
    }
);

router.post(
    '/',
    protectRoute,
    recipeValidationRules,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userId = req.user.id;
            const { title, ingredients, instructions } = req.body;

            const newRecipe = await Recipe.create({
                title,
                ingredients,
                instructions,
                user_id: userId,
            });

            const keys = cache.keys();
            const userKeys = keys.filter(k => k.startsWith(`user_${userId}_`));
            cache.del(userKeys);
            console.log(`CACHE: Cache invalidado para user_${userId}`);

            res.status(201).json(newRecipe);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro no servidor ao criar receita.' });
        }
    }
);

export default router;