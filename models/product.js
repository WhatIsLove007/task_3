import { Model } from 'sequelize';

export default class Product extends Model {
  
  static init = (sequelize, DataTypes) => {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: {model: 'Categories'}
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {sequelize})
  }

  static associate(models) {
    this.belongsToMany(models.Order, {through: models.OrderProduct, foreignKey: 'productId'});
    this.hasMany(models.OrderProduct, {onDelete: 'cascade', foreignKey: 'productId'});
    this.belongsTo(models.Category, {foreignKey: 'categoryId'});
    this.hasMany(models.Comment, {onDelete: 'cascade', foreignKey: 'productId'});
  }
  
};