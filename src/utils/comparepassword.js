import bcrypt from "bcrypt";

export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error comparing password:", error.message);
    throw error;
  }
};
