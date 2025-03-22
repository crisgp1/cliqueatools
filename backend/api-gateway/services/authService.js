/**
 * Auth service client
 * Handles communication with the auth-service microservice
 */

const axios = require('axios');

// Service configuration
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';

/**
 * Auth service client with methods to interact with the auth microservice
 */
const authService = {
  /**
   * Authenticate user using username and password
   * 
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} - Authentication result with user and token
   */
  async login(credentials) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Auth service login error:', error.message);
      
      // Extract and propagate error message from auth service
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Authentication failed');
      }
      
      throw new Error('Authentication service unavailable');
    }
  },
  
  /**
   * Register a new user
   * 
   * @param {Object} userData - User data for registration
   * @returns {Promise<Object>} - Registered user data
   */
  async register(userData) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Auth service register error:', error.message);
      
      // Extract and propagate error message from auth service
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Registration failed');
      }
      
      throw new Error('Authentication service unavailable');
    }
  },
  
  /**
   * Verify a JWT token with the auth service
   * 
   * @param {string} token - JWT token to verify
   * @returns {Promise<Object>} - Token verification result
   */
  async verifyToken(token) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/verify`, { token });
      return response.data;
    } catch (error) {
      console.error('Auth service token verification error:', error.message);
      
      // Extract and propagate error message from auth service
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Token verification failed');
      }
      
      throw new Error('Authentication service unavailable');
    }
  }
};

module.exports = authService;