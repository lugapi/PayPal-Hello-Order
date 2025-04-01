// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5501;

// Fonction pour obtenir un token d'accès PayPal
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios({
      method: 'post',
      url: `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      data: 'grant_type=client_credentials'
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token:', error.message);
    throw error;
  }
}

// Route pour créer un ordre
app.get('/createOrder/:intent', async (req, res) => {
  try {
    let intentToSend;

    if(req.params.intent === 'iWantCapture'){
      intentToSend = 'CAPTURE';
    } else if(req.params.intent === 'iWantAuthorize') {
      intentToSend = 'AUTHORIZE';
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios({
      method: 'post',
      url: `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        intent: intentToSend,
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: '10.00'
            }
          }
        ]
      }
    });
    
    res.json({
      status: 'success',
      order: response.data
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ordre:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.send('Serveur PayPal fonctionnel. Utilisez /createOrder/iWantCapture pour créer un ordre.');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
