import jwt from 'jsonwebtoken';

import {
   AUTHORIZATION_SECRET_KEY,
   AUTHORIZATION_TOKEN_EXPIRE_REMEMBER,
   AUTHORIZATION_TOKEN_SECRET
} from '../config/const.js';


export const generateAccessToken = id => jwt.sign({id}, AUTHORIZATION_SECRET_KEY, {expiresIn: '1800s'});