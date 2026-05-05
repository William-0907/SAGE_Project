// API configuration - update this based on your testing environment
export const API_CONFIG = {
  // Local machine IP (for devices on same network)
  LOCAL: 'http://192.168.1.14:8000/api',
  
  // ngrok tunnel URL (for testing multiple devices anywhere)
  TUNNEL: 'https://slouchy-photo-delivery.ngrok-free.dev/api',
  
  // For testing on same device (web only)
  // LOCALHOST: 'http://localhost:8000/api',
};

// Select which config to use
export const API_BASE_URL = API_CONFIG.TUNNEL;
