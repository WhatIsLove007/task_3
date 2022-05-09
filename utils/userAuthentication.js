import jwt from 'jsonwebtoken';
import models from '../models';

import {AUTHORIZATION_SECRET_KEY} from '../config/const.js';


export const generateAccessToken = (id, email) => {
   return `Bearer ${jwt.sign({id, email}, AUTHORIZATION_SECRET_KEY, {expiresIn: '1800s'})}`;
};

export const authenticateToken = async authorization => {

   const token = authorization.split(' ')[1];

   if (!token) return null;

   try {

      const decoded = jwt.verify(token, AUTHORIZATION_SECRET_KEY);

      const user = await models.User.findOne({where: {id: decoded.id, email: decoded.email}});
      if (!user) return null;

      return user;
   
   } catch (error) {
      return null;
   }
      

}