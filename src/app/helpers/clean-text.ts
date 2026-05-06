export function cleanText(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD').replace(/\p{M}/gu, '')
        .replace(/[^a-z0-9,\s]/g, '') // keep letters, digits, comma, spaces
        .replace(/\s+/g, ' ')
        .trim();
}