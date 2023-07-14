const crypto = require('crypto');
// Initialize encryption key variable nd encryption IV variable
let encryptionKey = null;
let encryptionIV = null;

// Generate a random encryption key and IV if not already generated
const generateEncryptionKeyAndIV = () => {
  if (!encryptionKey || !encryptionIV) {
    encryptionKey = crypto.randomBytes(32); // 32-byte encryption key
    encryptionIV = crypto.randomBytes(16); // 16-byte initialization vector (IV)
  }
};

// Encrypt data using AES-256 encryption
const encryptData = (data) => {
  generateEncryptionKeyAndIV(); // Generate encryption key and IV if not already generated

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    encryptionKey,
    encryptionIV
  );
  let encryptedData = cipher.update(data, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
};

// Decrypt data using AES-256 encryption
const decryptData = (encryptedData) => {
  generateEncryptionKeyAndIV(); // Generate encryption key and IV if not already generated

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    encryptionKey,
    encryptionIV
  );
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
};

module.exports = {
  decryptData,
  encryptData,
};
