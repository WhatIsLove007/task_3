'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Users'},
        onDelete: 'cascade',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Products'},
        onDelete: 'cascade',
      },
      commentId: {
        type: Sequelize.INTEGER,
        references: {model: 'Comments'},
        onDelete: 'cascade',
      },
      type: {
        type: Sequelize.ENUM,
        values: ['REVIEW', 'COMMENT'],
        allowNull: false,
      },
      assessment: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      advantages: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      disadvantages: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};