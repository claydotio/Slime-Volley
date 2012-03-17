/*
 * clay-encryption
 *
 * Quick and simple library for encrypting
 * and decrypting objects to be passed to clay.io
 */

// dependencies (note that jwt-simple requires crypto)
var jwt = require( '/usr/local/lib/node_modules/jwt-simple' );

Clay = ( function()
{
	// The associated user
	Clay.identifier = '';
	
	// The developer's secret key
	Clay.secretKey = '';
	
	/**
	 * @param {String} identifier - unique identifier for player
	 * @param {String} secretKey - secret key for this game
	 */
	function Clay( identifier, secretKey )
	{
		if( typeof identifier != 'undefined' )
			Clay.identifier = identifier

		if( typeof secretKey != 'undefined' )
			Clay.secretKey = secretKey
	}
	
	/** 
	 * Stores the user's unique identifier
	 * @param {String} identifier
	 */
	Clay.prototype.storeIdentifier = function( identifier )
	{
		Clay.identifier = identifier;
	}
	
	/**
	 * Encodes jwt
	 * @param {Object} options
	 */
	Clay.prototype.encode = function( options )
	{
		// Add the necessary options
		options.identifier = Clay.identifier;
		options.timestamp = Math.round( new Date().getTime() / 1000 )
		
		return jwt.encode( options, Clay.secretKey );
	}
	
	/**
	 * Decodes jwt
	 * @param {String} JWT encoded string
	 */
	Clay.prototype.decode = function( options )
	{
		return jwt.decode( options, Clay.secretKey );
	}
	
	return Clay;
} )();

module.exports = Clay