import models from '../models'


export const resolvers = {
  Query: {
    getUsers: async () => await models.User.findAll({include: models.Balance}),
    getUser: async (_, { id }) => await models.User.findByPk(id, {include: models.Balance}),

    getOrder: async (_, { id }) => {
      return await models.Order.findByPk(id, {
        include: {
          model: models.OrderProduct, 
          required: false,
          include: {
            model: models.Product,
            required: false,
            include: {
              model: models.Category,
              required: false,
            }
          }
        }
      });
    },

    getCategories: async () => await models.Category.findAll(),

    getProducts: async () => await models.Product.findAll({include: models.Category}),
    getProduct: async (_, { id }) => await models.Product.findByPk(id, {include: models.Category}),

    getComments: async (_, { productId }) => {
      return await models.Comment.findAll({
        where: {productId},
        include: {
          model: models.Reaction,
          required: false,
        }
      });
    },

  },
};