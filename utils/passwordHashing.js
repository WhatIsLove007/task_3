import bcrypt from 'bcrypt';


export const hash = async password => crypt.hash(password, 10);

export const compare = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);