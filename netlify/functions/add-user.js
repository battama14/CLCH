const crypto = require('crypto');

exports.handler = async (event, context) => {
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
    const { adminToken, newUsername, newPassword } = JSON.parse(event.body);

    // Vérifier que l'utilisateur est admin
    if (!adminToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token admin requis' })
      };
    }

    // Générer le hash pour le nouveau mot de passe
    const hash = crypto.createHash('md5').update(newPassword + 'TradingSalt2024').digest('hex');

    // Retourner les informations pour que l'admin puisse configurer manuellement
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        username: newUsername,
        hash: hash,
        instructions: `Ajoutez cette variable d'environnement dans Netlify:\n${newUsername.toUpperCase()}_HASH = ${hash}`
      })
    };
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