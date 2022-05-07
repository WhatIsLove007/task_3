import { Model } from 'sequelize';

export default class Order extends Model {
  
  static init = (sequelize, DataTypes) => {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: 'Users'},
        onDelete: 'cascade',
      },
      paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      deliveryStatus: {
        type: DataTypes.ENUM,
        values: ['IN_TRANSIT', 'DELIVERED', 'RECIEVED'],
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {updatedAt: false, sequelize})
  }

  static associate(models) {
    this.belongsToMany(models.Product, {through: models.OrderProduct, foreignKey: 'orderId'});
    this.hasMany(models.OrderProduct, {onDelete: 'cascade', foreignKey: 'orderId'});
    this.belongsTo(models.User, {onDelete: 'cascade', foreignKey: 'userId'});
  }
  
};