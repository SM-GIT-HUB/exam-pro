import bcrypt from "bcryptjs"

async function hashPassword(password)
{
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePassword(password, hashedPassword)
{
  return await bcrypt.compare(password, hashedPassword);
}

export { hashPassword, comparePassword }