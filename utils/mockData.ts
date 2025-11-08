// Mock data representing KnotAPI transaction data

export function generateHeatmapData(
  center: [number, number],
  category: string
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const numPoints = 200;
  const radius = 0.05; // degrees (roughly 5km)

  for (let i = 0; i < numPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const lat = center[0] + distance * Math.cos(angle);
    const lng = center[1] + distance * Math.sin(angle);
    
    // Intensity represents number of orders
    let intensity = Math.random();
    
    // Different categories have different order patterns
    if (category === 'mexican' || category === 'chinese') {
      intensity *= 0.9; // High volume
    } else if (category === 'indian' || category === 'thai') {
      intensity *= 0.7;
    } else if (category === 'japanese') {
      intensity *= 0.6;
    }
    
    // Create hotspots
    if (Math.random() > 0.7) {
      intensity *= 1.5;
    }
    
    points.push([lat, lng, Math.min(intensity, 1)]);
  }

  return points;
}

export function getAreaInsights(category: string) {
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
