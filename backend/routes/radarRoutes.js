/**
 * Rutas para la API de Radar
 * Estas rutas utilizan el controlador radarController para manejar las peticiones
 */

const express = require('express');
const router = express.Router();
const radarController = require('../controllers/radarController');

/**
 * @route   GET /api/radar/geocode
 * @desc    Geocodificar una dirección (texto a coordenadas)
 * @access  Public
 * @query   {string} query - Texto de la dirección a geocodificar
 * @query   {string} country - Código de país (default: 'mx')
 */
router.get('/geocode', radarController.geocodeAddress);

/**
 * @route   GET /api/radar/reverse
 * @desc    Geocodificación inversa (coordenadas a dirección)
 * @access  Public
 * @query   {number} latitude - Latitud
 * @query   {number} longitude - Longitud
 */
router.get('/reverse', radarController.reverseGeocode);

/**
 * @route   GET /api/radar/zipcode/:zipCode
 * @desc    Buscar ubicación por código postal
 * @access  Public
 * @param   {string} zipCode - Código postal a buscar
 * @query   {string} country - Código de país (default: 'mx')
 */
router.get('/zipcode/:zipCode', radarController.getLocationByZipCode);

/**
 * @route   GET /api/radar/search
 * @desc    Buscar direcciones por texto con autocompletado
 * @access  Public
 * @query   {string} query - Texto de búsqueda
 * @query   {string} near - Coordenadas cercanas formato "latitud,longitud" (opcional)
 * @query   {number} limit - Límite de resultados (default: 10)
 * @query   {string} country - Código de país (default: 'mx')
 */
router.get('/search', radarController.searchAddressByText);

/**
 * @route   POST /api/radar/validate
 * @desc    Validar una dirección completa
 * @access  Public
 * @body    {string} street - Calle
 * @body    {string} houseNumber - Número exterior
 * @body    {string} city - Ciudad
 * @body    {string} stateCode - Código de estado
 * @body    {string} postalCode - Código postal
 * @body    {string} countryCode - Código de país (default: 'mx')
 * @body    {string} unit - Unidad o número interior (opcional)
 */
router.post('/validate', radarController.validateAddress);

module.exports = router;