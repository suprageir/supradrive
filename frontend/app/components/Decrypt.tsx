export const Decrypt = async (jsonInput: any, key: any) => {
    if (!key) return "";
    if (!jsonInput) throw new Error("Invalid input");

    const { iv, salt, encryptedText } = JSON.parse(jsonInput);

    if (!encryptedText || !iv || !salt) {
        throw new Error("Input must contain iv, salt, and encryptedText");
    }

    const ivArray = Array.isArray(iv) ? new Uint8Array(iv) : new Uint8Array(JSON.parse(iv));
    const saltArray = Array.isArray(salt) ? new Uint8Array(salt) : new Uint8Array(JSON.parse(salt));

    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const decryptionKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltArray,
            iterations: 100000,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const encryptedData = new Uint8Array(
        atob(encryptedText)
            .split("")
            .map((char) => char.charCodeAt(0))
    );

    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivArray },
            decryptionKey,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    } catch (error) {
        throw new Error("Decryption failed. Make sure the key is correct and the input is valid." + error);
    }
};