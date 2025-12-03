export const badWords = [
    "sexual", "pedo", "pedophile", "nigro", "nigger", "nigga", "bitch", "fuck", "shit", "ass", "asshole", "cunt", "dick", "pussy", "whore", "slut", "bastard", "damn", "cock", "suck"
];

export function containsBadLanguage(text: string): boolean {
    const lowerText = text.toLowerCase();
    return badWords.some(word => {
        // strict word boundary check to avoid false positives (e.g. "ass" in "class")
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(lowerText);
    });
}
