import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { User } from './UserModel.js';

export const Recipe = sequelize.define(
    'Recipe',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ingredients: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Recipe',
        tableName: 'recipes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

User.hasMany(Recipe, { foreignKey: 'user_id' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });