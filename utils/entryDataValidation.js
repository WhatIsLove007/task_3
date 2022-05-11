import validator from 'validator';


export const validateEmail = email => validator.isEmail(email);

export const validatePassword = password => /^[a-zA-Z0-9_]{4,16}$/.test(password);

export const validatePositiveNumbers = numbers => {

   if (!numbers.length) return false;

   for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 1) return false;
   }

   return true;

}