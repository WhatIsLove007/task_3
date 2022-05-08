import bcrypt from 'bcrypt';


export const hash = async password => await bcrypt.hash(password, 10);

export const compare = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);