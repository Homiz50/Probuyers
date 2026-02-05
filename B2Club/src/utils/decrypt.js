import CryptoJS from "crypto-js";

// Must match your backend key and IV
const key = CryptoJS.enc.Utf8.parse("12345678901234567890123456789012");
const iv = CryptoJS.enc.Utf8.parse("1234567890123456");

/**
 * Decrypt AES-encrypted response
 * @param {string} encryptedText - Base64 encoded AES ciphertext from backend
 * @returns {object} - Parsed JSON data
 */
function decryptResponse(encryptedText) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

export default decryptResponse;
