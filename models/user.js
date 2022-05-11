import { Model } from 'sequelize';

export default class User extends Model {
  
  static init = (sequelize, DataTypes) => {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ACTIVE', 'BANNED'],
        allowNull: false,
        defaulfValue: 'ACTIVE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: ['CUSTOMER', 'MANAGER', 'ADMIN'],
        allowNull: false,
        defaultValue: 'CUSTOMER',
     },
      
  }, {updatedAt: false, sequelize})
  }

  static associate(models) {
    this.hasOne(models.Balance, {onDelete: 'cascade', foreignKey: 'userId'});
    this.hasMany(models.Order, {onDelete: 'cascade', foreignKey: 'userId'});
    this.hasMany(models.Comment, {onDelete: 'cascade', foreignKey: 'userId'})
    // this.hasMany(models.Comment, {through: models.Reaction, foreignKey: 'userId', onDelete: 'cascade'});
  }
  
};