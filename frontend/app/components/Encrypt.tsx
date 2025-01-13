interface EncryptedResult {
    iv: number[];
    salt: number[];
    encryptedText: string;
}

export const Encrypt = async (text: string, key: string): Promise<EncryptedResult | string> => {
    if (!key) return "";
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const saltArray = Array.from(salt);

    const encryptionKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ivArray = Array.from(iv);

    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        encoder.encode(text)
    );

    return {
        iv: Array.from(iv),
        salt: Array.from(salt),
        encryptedText: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    };
};
