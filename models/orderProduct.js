import { Model } from 'sequelize';

export default class OrderProduct extends Model {
  
  static init = (sequelize, DataTypes) => {
    return super.init({
      orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {model: 'Orders'},
        onDelete: 'cascade',
      },
      productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {model: 'Products'},
        onDelete: 'cascade',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
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
    this.belongsTo(models.Order, {onDelete: 'cascade', foreignKey: 'orderId'});
    this.belongsTo(models.Product, {onDelete: 'cascade', foreignKey: 'productId'});
  }
  
};