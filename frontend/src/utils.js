// Utility functions for the Supply Chain Risk Radar

/**
 * Get color based on risk level
 */
export const getRiskColor = (risk) => {
  const colors = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#10b981'
  };
  return colors[risk] || colors.LOW;
};

/**
 * Get emoji icon based on risk level
 */
export const getRiskIcon = (risk) => {
  const icons = {
    HIGH: '🔴',
    MEDIUM: '🟡',
    LOW: '🟢'
  };
  return icons[risk] || icons.LOW;
};

/**
 * Format timestamp to relative time
 */
export const getTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/**
 * Calculate overall risk score from suppliers
 */
export const calculateOverallRisk = (suppliers) => {
  if (!suppliers || suppliers.length === 0) return 'LOW';
  
  const highRisk = suppliers.filter(s => s.risk === 'HIGH').length;
  const mediumRisk = suppliers.filter(s => s.risk === 'MEDIUM').length;
  
  if (highRisk > 0) return 'HIGH';
  if (mediumRisk > suppliers.length / 2) return 'MEDIUM';
  return 'LOW';
};

/**
 * Generate random data for demo purposes
 */
export const generateRandomData = (count) => {
  const locations = [
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437 },
    { name: 'Rotterdam, Netherlands', lat: 51.9225, lng: 4.47917 },
    { name: 'Shanghai, China', lat: 31.2304, lng: 121.4737 }
  ];
  
  const risks = ['HIGH', 'MEDIUM', 'LOW'];
  
  return Array.from({ length: count }, (_, i) => {
    const location = locations[i % locations.length];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    
    return {
      name: `Supplier ${i + 1}`,
      location: location.name,
      lat: location.lat,
      lng: location.lng,
      risk: risk,
      reason: `Sample reason for ${risk} risk`
    };
  });
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Determine risk level from news title
 */
export const getRiskFromTitle = (title) => {
  const lowerTitle = title.toLowerCase();
  
  const highRiskKeywords = ['strike', 'shutdown', 'disaster', 'critical', 'emergency', 'severe'];
  const mediumRiskKeywords = ['delay', 'warning', 'concern', 'issue', 'congestion'];
  
  if (highRiskKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'HIGH';
  }
  
  if (mediumRiskKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
};

/**
 * Sort suppliers by risk level
 */
export const sortByRisk = (suppliers) => {
  const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...suppliers].sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
};

/**
 * Filter suppliers by risk level
 */
export const filterByRisk = (suppliers, riskLevel) => {
  if (riskLevel === 'ALL') return suppliers;
  return suppliers.filter(s => s.risk === riskLevel);
};

/**
 * Get risk statistics
 */
export const getRiskStats = (suppliers) => {
  const stats = {
    total: suppliers.length,
    high: suppliers.filter(s => s.risk === 'HIGH').length,
    medium: suppliers.filter(s => s.risk === 'MEDIUM').length,
    low: suppliers.filter(s => s.risk === 'LOW').length
  };
  
  stats.percentage = {
    high: ((stats.high / stats.total) * 100).toFixed(1),
    medium: ((stats.medium / stats.total) * 100).toFixed(1),
    low: ((stats.low / stats.total) * 100).toFixed(1)
  };
  
  return stats;
};

/**
 * Validate supplier data structure
 */
export const isValidSupplier = (supplier) => {
  return (
    supplier &&
    typeof supplier.name === 'string' &&
    typeof supplier.location === 'string' &&
    typeof supplier.lat === 'number' &&
    typeof supplier.lng === 'number' &&
    ['HIGH', 'MEDIUM', 'LOW'].includes(supplier.risk)
  );
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};