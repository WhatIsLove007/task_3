import { gql } from 'apollo-server-express';


export const typeDefs = gql`

  type User {
    id: Int
    email: String
    fullName: String
    phone: String
    status: String
    createdAt: String
    Balance: Balance
  }

  type Balance {
    userId: Int
    account: Float
    discount: Int
  }

  type Order {
    id: Int
    userId: Int
    paid: Boolean
    deliveryStatus: String
    createdAt: String
    OrderProducts: [OrderProduct]
  }

  type OrderProduct {
    orderId: Int
    productId: Int
    quantity: Int
    purchasePrice: Float
    createdAt: String
    updatedAt: String
    Product: Product
  }

  type Category {
    id: Int
    name: String
    parentId: Int
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: Int
    categoryId: Int
    name: String
    description: String
    price: Int
    createdAt: String
    updatedAt: String
    Category: Category
  }

  type Comment {
    id: Int
    userId: Int
    productId: Int
    commentId: Int
    type: String
    assesment: Int
    comment: String
    advantages: String
    disadvantages: String
    createdAt: String
    Reactions: [Reaction]
  }
  
  type Reaction {
    commentId: Int
    userId: Int
    reaction: String
    createdAt: String
  }


  type Query {
    getUsers: [User]
    getUser(id: Int): User

    getOrder(id: Int): Order

    getCategories: [Category]

    getProducts: [Product]
    getProduct(id: Int): Product

    getComments(productId: Int): [Comment]
  }

`;