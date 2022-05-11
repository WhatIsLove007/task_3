'use strict';

module.exports = {

   async up(queryInterface, Sequelize) {

      await queryInterface.removeColumn('Users', 'isAdmin');

      await queryInterface.addColumn('Users', 'role', {
         type: Sequelize.ENUM,
         values: ['CUSTOMER', 'MANAGER', 'ADMIN'],
         allowNull: false,
         defaultValue: 'CUSTOMER',
      });




   },

   async down(queryInterface, Sequelize) {

      await queryInterface.removeColumn('Users', 'role');

      await queryInterface.addColumn('Users', 'isAdmin', {
         type: Sequelize.BOOLEAN,
         defaultValue: false,
         allowNull: false,
      });

   }

};