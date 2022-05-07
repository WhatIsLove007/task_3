import { Model } from 'sequelize';

export default class Reaction extends Model {
  
  static init = (sequelize, DataTypes) => {
    return super.init({
      commentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {model: 'Comments'},
        onDelete: 'cascade',
      },
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {model: 'Users'},
        onDelete: 'cascade',
      },
      reaction: {
        type: DataTypes.ENUM,
        values: ['LIKE', 'DISLIKE'],
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {updatedAt: false, sequelize})
  }

  static associate(models) {
    this.belongsTo(models.User, {onDelete: 'cascade', foreignKey: 'userId'});
    this.belongsTo(models.Comment, {onDelete: 'cascade', foreignKey: 'commentId'});
  }
  
};