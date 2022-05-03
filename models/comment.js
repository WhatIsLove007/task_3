import { Model } from 'sequelize';

export default class Comment extends Model {
  
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
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: 'Products'},
        onDelete: 'cascade',
      },
      commentId: {
        type: DataTypes.INTEGER,
        references: {model: 'Comments'},
        onDelete: 'cascade',
      },
      type: {
        type: DataTypes.ENUM,
        values: ['REVIEW', 'COMMENT'],
        allowNull: false,
      },
      assessment: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      advantages: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      disadvantages: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {sequelize})
  }

  static associate(models) {
    this.belongsTo(models.Product, {onDelete: 'cascade', foreignKey: 'productId'});
    this.belongsTo(models.User, {onDelete: 'cascade', foreignKey: 'userId'});
    this.hasMany(models.Comment, {onDelete: 'cascade', foreignKey: 'commentId'});
    this.hasMany(models.Reaction, {onDelete: 'cascade', foreignKey: 'commentId'});
  }
  
};