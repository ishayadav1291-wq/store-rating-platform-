const validatePassword = (pwd) => {
  if (pwd.length < 8 || pwd.length > 16) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
  return true;
};

const validateName = (name) => {
  return name.length >= 20 && name.length <= 60;
};

const validateAddress = (addr) => {
  return addr.length <= 400 && addr.length > 0;
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

module.exports = { validatePassword, validateName, validateAddress, validateEmail };
