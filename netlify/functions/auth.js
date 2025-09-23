const crypto = require('crypto');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Utilisateurs (hashes stockés dans variables d'environnement)
    const users = {
      admin: process.env.ADMIN_HASH || 'a8f5f167f44f4964e6c998dee827110c',
      demo_admin: process.env.DEMO_ADMIN_HASH || '5d41402abc4b2a76b9719d911017c592',
      demo_trader: process.env.DEMO_TRADER_HASH || '098f6bcd4621d373cade4e832627b4f6',
      demo_user: process.env.DEMO_USER_HASH || '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      guest: process.env.GUEST_HASH || 'f25a2fc72690b780b2a14e140ef6a9e0'
    };

    // Hash du mot de passe avec salt
    const hash = crypto.createHash('md5').update(password + 'TradingSalt2024').digest('hex');

    if (users[username] && users[username] === hash) {
      // Générer un token JWT simple
      const token = Buffer.from(JSON.stringify({
        user: username,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24h
      })).toString('base64');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: username
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Identifiants incorrects'
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erreur serveur'
      })
    };
  }
};
