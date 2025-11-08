// Mock data representing KnotAPI transaction data

export function generateHeatmapData(
  center: [number, number],
  category: string
): [number, number, number][] {
  // Deterministic, seeded generator so the heatmap is repeatable per center+category.
  function hashString(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const seed = hashString(`${center[0].toFixed(6)}|${center[1].toFixed(6)}|${category}`);
  const rand = mulberry32(seed);

  const points: [number, number, number][] = [];
  const numPoints = 220;
  const radius = 0.05; // degrees (roughly 5km)

  const categoryMultipliers: Record<string, number> = {
    mexican: 1.0,
    chinese: 0.95,
    indian: 0.8,
    japanese: 0.7,
    italian: 0.9,
    thai: 0.75,
    default: 0.8,
  };

  const catMul = categoryMultipliers[category] ?? categoryMultipliers.default;

  for (let i = 0; i < numPoints; i++) {
    const angle = rand() * 2 * Math.PI;
    const distance = Math.sqrt(rand()) * radius; // bias to center

    const lat = center[0] + distance * Math.cos(angle);
    const lng = center[1] + distance * Math.sin(angle);

    const sigma = radius * 0.5;
    const decay = Math.exp(-((distance * distance) / (2 * sigma * sigma)));

    let intensity = decay * (0.4 + 0.6 * rand()) * catMul;

    if (rand() > 0.85) {
      intensity *= 1.8 + rand() * 1.2;
    }

    points.push([lat, lng, Math.min(intensity, 1)]);
  }

  return points;
}

export function getAreaInsights(category: string, location?: { lat: number; lng: number }) {
  // Templates for categories
  const cuisineData: Record<string, any> = {
    mexican: {
      popularItems: [
        { name: 'Chicken Burrito Bowl', orders: 1834, price: 12.99, growth: 28 },
        { name: 'Carne Asada Tacos (3)', orders: 1567, price: 11.99, growth: 22 },
        { name: 'Guacamole & Chips', orders: 1432, price: 8.99, growth: 18 },
        { name: 'Steak Quesadilla', orders: 1298, price: 13.99, growth: 25 },
        { name: 'Chicken Enchiladas', orders: 1104, price: 14.99, growth: 15 },
      ],
      totalOrders: 8234,
      avgOrderValue: 16.50,
      opportunityScore: 78,
      opportunityMessage: 'High demand with moderate competition. Good opportunity for fast-casual Mexican.'
    },
    indian: {
      popularItems: [
        { name: 'Chicken Tikka Masala', orders: 1654, price: 16.99, growth: 35 },
        { name: 'Garlic Naan (2pc)', orders: 1432, price: 4.99, growth: 30 },
        { name: 'Butter Chicken', orders: 1298, price: 17.99, growth: 32 },
        { name: 'Biryani', orders: 1176, price: 15.99, growth: 28 },
        { name: 'Samosas (4pc)', orders: 987, price: 6.99, growth: 22 },
      ],
      totalOrders: 7123,
      avgOrderValue: 22.50,
      opportunityScore: 85,
      opportunityMessage: 'Growing demand with limited supply. Excellent opportunity for authentic Indian cuisine.'
    },
    italian: {
      popularItems: [
        { name: 'Margherita Pizza', orders: 2134, price: 16.99, growth: 15 },
        { name: 'Spaghetti Carbonara', orders: 1876, price: 18.99, growth: 12 },
        { name: 'Fettuccine Alfredo', orders: 1654, price: 17.99, growth: 10 },
        { name: 'Lasagna', orders: 1432, price: 19.99, growth: 18 },
        { name: 'Caesar Salad', orders: 1298, price: 12.99, growth: 8 },
      ],
      totalOrders: 9234,
      avgOrderValue: 24.80,
      opportunityScore: 62,
      opportunityMessage: 'Saturated market with high competition. Differentiation is key.'
    },
    chinese: {
      popularItems: [
        { name: "General Tso's Chicken", orders: 1987, price: 13.99, growth: 20 },
        { name: 'Fried Rice (Combo)', orders: 1765, price: 11.99, growth: 18 },
        { name: 'Lo Mein Noodles', orders: 1543, price: 12.99, growth: 16 },
        { name: 'Orange Chicken', orders: 1432, price: 13.99, growth: 22 },
        { name: 'Spring Rolls (6pc)', orders: 1298, price: 7.99, growth: 15 },
      ],
      totalOrders: 8654,
      avgOrderValue: 18.20,
      opportunityScore: 70,
      opportunityMessage: 'Steady demand with room for modern/upscale concepts.'
    },
    japanese: {
      popularItems: [
        { name: 'California Roll (8pc)', orders: 1876, price: 11.99, growth: 24 },
        { name: 'Spicy Tuna Roll (8pc)', orders: 1654, price: 13.99, growth: 28 },
        { name: 'Chicken Ramen', orders: 1543, price: 14.99, growth: 32 },
        { name: 'Salmon Sashimi (6pc)', orders: 1298, price: 16.99, growth: 20 },
        { name: 'Edamame', orders: 1104, price: 5.99, growth: 15 },
      ],
      totalOrders: 7234,
      avgOrderValue: 26.40,
      opportunityScore: 82,
      opportunityMessage: 'Growing interest in ramen and sushi. Strong opportunity for quality-focused concepts.'
    },
    thai: {
      popularItems: [
        { name: 'Pad Thai', orders: 1987, price: 14.99, growth: 30 },
        { name: 'Green Curry', orders: 1543, price: 15.99, growth: 28 },
        { name: 'Tom Yum Soup', orders: 1298, price: 12.99, growth: 25 },
        { name: 'Drunken Noodles', orders: 1176, price: 14.99, growth: 26 },
        { name: 'Spring Rolls (4pc)', orders: 987, price: 7.99, growth: 18 },
      ],
      totalOrders: 6834,
      avgOrderValue: 21.30,
      opportunityScore: 88,
      opportunityMessage: 'High growth potential with underserved market. Excellent opportunity.'
    },
  };
  // If no location is provided, return a deterministic base template
  if (!location) {
    const data = cuisineData[category] || {
      popularItems: [
        { name: 'House Special', orders: 1500, price: 15.99, growth: 20 },
        { name: 'Popular Dish #2', orders: 1200, price: 14.99, growth: 18 },
        { name: 'Popular Dish #3', orders: 1000, price: 13.99, growth: 15 },
        { name: 'Popular Dish #4', orders: 850, price: 12.99, growth: 12 },
        { name: 'Popular Dish #5', orders: 700, price: 11.99, growth: 10 },
      ],
      totalOrders: 7500,
      avgOrderValue: 19.99,
      opportunityScore: 75,
      opportunityMessage: 'Moderate opportunity with balanced supply and demand.'
    };

    return {
      ...data,
      dailySpending: [
        { day: 'Monday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.12) },
        { day: 'Tuesday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.11) },
        { day: 'Wednesday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.13) },
        { day: 'Thursday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.14) },
        { day: 'Friday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.18) },
        { day: 'Saturday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.20) },
        { day: 'Sunday', amount: Math.round(data.avgOrderValue * data.totalOrders * 0.12) },
      ],
      monthlySpending: Math.round(data.avgOrderValue * data.totalOrders * 30),
      yearlySpending: Math.round(data.avgOrderValue * data.totalOrders * 365),
    };
  }

  // Deterministic PRNG seeded with location+category
  function hashString(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const seed = hashString(`${location.lat.toFixed(6)}|${location.lng.toFixed(6)}|${category}`);
  const rand = mulberry32(seed);

  // Estimate local intensity from a small deterministic heatmap
  const heat = generateHeatmapData([location.lat, location.lng], category);
  const avgIntensity = heat.reduce((s, p) => s + p[2], 0) / heat.length;

  const base = cuisineData[category] || {
    popularItems: [
      { name: 'House Special', orders: 1500, price: 15.99, growth: 20 },
      { name: 'Popular Dish #2', orders: 1200, price: 14.99, growth: 18 },
      { name: 'Popular Dish #3', orders: 1000, price: 13.99, growth: 15 },
      { name: 'Popular Dish #4', orders: 850, price: 12.99, growth: 12 },
      { name: 'Popular Dish #5', orders: 700, price: 11.99, growth: 10 },
    ],
    totalOrders: 7500,
    avgOrderValue: 19.99,
    opportunityScore: 75,
    opportunityMessage: 'Moderate opportunity with balanced supply and demand.'
  };

  const intensityFactor = 0.6 + avgIntensity * 1.4; // roughly [0.6,2.0]
  const totalOrders = Math.max(0, Math.round(base.totalOrders * intensityFactor * (0.85 + rand() * 0.3)));
  const avgOrderValue = Number((base.avgOrderValue * (0.9 + rand() * 0.25)).toFixed(2));

  const baseSum = base.popularItems.reduce((s: number, it: any) => s + it.orders, 0) || 1;
  const popularItems = base.popularItems.map((it: any) => {
    const share = (it.orders / baseSum) * (0.7 + 0.6 * rand());
    return {
      name: it.name,
      orders: Math.max(0, Math.round(totalOrders * share)),
      price: it.price,
      growth: Math.max(0, Math.round(it.growth * (0.7 + rand() * 0.7))),
    };
  });

  const dayWeights = [0.11, 0.10, 0.12, 0.13, 0.16, 0.20, 0.18];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailySpending = dayWeights.map((w, i) => ({ day: days[i], amount: Math.round(avgOrderValue * totalOrders * w) }));

  const monthlySpending = Math.round(avgOrderValue * totalOrders * 30);
  const yearlySpending = Math.round(avgOrderValue * totalOrders * 365);

  const opportunityScore = Math.min(100, Math.max(20, Math.round(50 + (avgIntensity - 0.3) * 100 + rand() * 20)));

  return {
    popularItems,
    totalOrders,
    avgOrderValue,
    opportunityScore,
    opportunityMessage: base.opportunityMessage,
    dailySpending,
    monthlySpending,
    yearlySpending,
  };
}
