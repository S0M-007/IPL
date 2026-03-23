export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return crores % 1 === 0 ? `${crores} Cr` : `${crores.toFixed(2)} Cr`;
  }
  return `${lakhs} L`;
}

export function formatPriceShort(lakhs: number): string {
  if (lakhs >= 100) {
    return `${(lakhs / 100).toFixed(1)} Cr`;
  }
  return `${lakhs}L`;
}
