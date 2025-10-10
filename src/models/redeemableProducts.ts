// models/redeemableProducts.ts
export interface RedeemableProduct {
  name: string;
  points: number;
}

export const redeemableProducts: RedeemableProduct[] = [
  { name: "AQUADIN", points: 33 },
  { name: "ALIKA", points: 44 },
  { name: "CLINCHER", points: 78 },
  { name: "EXALT PLUS", points: 68 },
  { name: "BROFEYA", points: 148 },
  { name: "PYZERO", points: 85 },
  { name: "PERFECTHION", points: 73 },
  { name: "TOPSHOT", points: 73 },
  { name: "FUNGINIL", points: 43 },
  { name: "BASTA", points: 45 },
  { name: "UREA", points: 80 },
  { name: "14-14-14", points: 83 },
  { name: "YARA WINNER", points: 135 },
  { name: "CALCIUM", points: 84 },
  { name: "POTASSIUM", points: 85 },
];

export const isRedeemableProduct = (name: string): boolean => {
  return redeemableProducts.some(
    (p) => p.name.toUpperCase() === name.toUpperCase()
  );
};

export const getRedeemablePointCost = (name: string): number | null => {
  const match = redeemableProducts.find(
    (p) => p.name.toUpperCase() === name.toUpperCase()
  );
  return match ? match.points : null;
};
