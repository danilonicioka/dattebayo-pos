export function formatProductNameWithVariations(productName: string, variations: { name: string }[] | undefined): string {
    if (!variations || variations.length === 0) {
        return productName;
    }

    const variationNames = variations.map((v) => v.name.trim());
    const lowerProductName = productName.trim().toLowerCase();

    // Regra específica: se for Pastel, adicionamos "de" antes da PRIMEIRA variação (se já não tiver)
    // Ex: Pastel de Queijo + Carne
    const needsDePrefix = lowerProductName.includes('pastel');

    let formattedVariations = [...variationNames];

    if (needsDePrefix && formattedVariations.length > 0) {
        const firstVarLower = formattedVariations[0].toLowerCase();
        if (!firstVarLower.startsWith('de ')) {
            formattedVariations[0] = `de ${formattedVariations[0]}`;
        }
    }

    const variationsString = formattedVariations.join(' + ');
    return `${productName} ${variationsString}`.trim();
}
