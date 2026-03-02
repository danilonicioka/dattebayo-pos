export function formatProductNameWithVariations(productName: string, variations: { name: string }[] | undefined): string {
    if (!variations || variations.length === 0) {
        return productName;
    }

    const variationNames = variations.map((v) => v.name.trim());
    const lowerProductName = productName.trim().toLowerCase();

    // Regra específica: se for Pastel ou Temaki, adicionamos "de" antes da PRIMEIRA variação (se já não tiver)
    // Ex: Pastel de Queijo + Carne
    const needsDePrefix = ['pastel', 'temaki'].some(word => lowerProductName.includes(word));

    let formattedVariations = [...variationNames];

    if (needsDePrefix && formattedVariations.length > 0) {
        const firstVarLower = formattedVariations[0].toLowerCase();
        // Só adiciona o "de" se a variação já não começar com "de "
        if (!firstVarLower.startsWith('de ')) {
            // Usa 'de' ou 'De' padronizado
            formattedVariations[0] = `De ${formattedVariations[0]}`;
        }
    }

    // Une as variações com " + "
    const variationsString = formattedVariations.join(' + ');

    return `${productName} ${variationsString}`.trim();
}
