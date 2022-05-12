import {gql} from 'apollo-server-express';

import models from '../../models';
import * as entryDataValidation from '../../utils/entryDataValidation.js';
import { USER_ROLES } from '../../config/const.js';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';



export default class Category {
   static resolver() {
      return {

         Query: {
            getCategories: async () => await models.Category.findAll(),

         },

         Mutation: {
            
            addCategory: async (parent, {name, parentId}, context) => {

               if (context.user?.role !== USER_ROLES.ADMIN) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);


               try {

                  const existingCategory = await models.Category.findOne({where: {name}});
                  if (existingCategory) throw new Error(THROW_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);

                  if (parentId) {
                     const parentCategory = await models.Category.findOne({where: {id: parentId}});
                     if (!parentCategory) throw new Error('Parent category not found');
                  }
                  
                  return await models.Category.create({ name, ...(parentId && {parentId}) });
                  
               } catch (error) {
                  throw new Error(error.message);
               }
            },

            removeCategory: async (parent, { id }, context) => {

               if (context.user?.role !== USER_ROLES.ADMIN) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);

               try {

                  const category = await models.Category.findByPk(id);
                  if (!category) throw new Error(THROW_ERROR_MESSAGES.CATEGORY_NOT_FOUND);

                  return await category.destroy();
                  
               } catch (error) {
                  throw new Error(error.message);
               }
            }

         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Category {
            id: Int
            name: String
            parentId: Int
            createdAt: String
            updatedAt: String
         }
     
          
      `
   }
}