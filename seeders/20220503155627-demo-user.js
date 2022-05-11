'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Users', [
      {
        email: 'elonmusk@gmail.com',
        fullName: 'Elon Musk',
        phone: '666-666-666',
        passwordHash: '$2b$10$sO5octfPuuba9h3epBhihesHUisCwB32giEaorgvVDoGiq6hMCAPC',
        createdAt: new Date(),
      },
      {
        email: 'billgates@gmail.com',
        fullName: 'Bill Gates',
        phone: '049-777-000',
        passwordHash: '$2b$10$fnCuU/JyXhH50noAQLjhb.SV/13RoBMtAyFIH1cNkFPnnmOo5qhHS',
        createdAt: new Date(),
      },
      {
        email: 'donaldtrump@mail.ru',
        fullName: 'Donald Trump',
        phone: '00-000-001',
        passwordHash: '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa',
        createdAt: new Date(),
      },

      {
        email: 'wtf.evgesha@gmail.com',
        fullName: 'Eugene Haiday',
        phone: '+380999056666',
        passwordHash: '$2b$10$Z6V6rl10Rx5E6m1JdCCrbeahNP4RnEmMOuQAcsPAvLlaMSVaQLSMG',
        createdAt: new Date(),
      },
      {
        email: 'nahornyi.vlad@gmail.com',
        fullName: 'Vladislav Nagorniy',
        phone: '+380669596666',
        passwordHash: '$2b$10$yInzlrAtgeDiBBySt7eAYux9auIWV7UofYzd/PKZnw/7Xsah7yxCJ',
        createdAt: new Date(),
      },
    ], {});

    await queryInterface.bulkInsert('Balances', [
      {
        userId: await queryInterface.rawSelect('Users', {where: {email: 'elonmusk@gmail.com'}}, ['id']),
        account: 7600000.00,
        createdAt: new Date(),
      },
      {
        userId: await queryInterface.rawSelect('Users', {where: {email: 'billgates@gmail.com'}}, ['id']),
        account: 999999.98,
        createdAt: new Date(),
      },
      {
        userId: await queryInterface.rawSelect('Users', {where: {email: 'donaldtrump@mail.ru'}}, ['id']),
        account: 55000000.00,
        createdAt: new Date(),
      },
      {
        userId: await queryInterface.rawSelect('Users', {where: {email: 'wtf.evgesha@gmail.com'}}, ['id']),
        account: 100.00,
        createdAt: new Date(),
      },
      {
        userId: await queryInterface.rawSelect('Users', {where: {email: 'nahornyi.vlad@gmail.com'}}, ['id']),
        account: 0.00,
        createdAt: new Date(),
      },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Balances', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
