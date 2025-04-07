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

// Route pour créer un ordre avec montant optionnel
app.all('/createOrder/:intent/:amount?', async (req, res) => {
  try {
    let intentToSend;

    if (req.params.intent === 'iWantCapture') {
      intentToSend = 'CAPTURE';
    } else if (req.params.intent === 'iWantAuthorize') {
      intentToSend = 'AUTHORIZE';
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Intent invalide. Utilisez iWantCapture ou iWantAuthorize'
      });
    }

    // Valeur par défaut de 10.00 si aucun montant n'est spécifié
    const amount = req.params.amount ? (parseFloat(req.params.amount) / 100).toFixed(2) : '10.00';

    const accessToken = await getPayPalAccessToken();

    // Génération du timestamp actuel
    const currentTimestamp = Math.floor(Date.now() / 1000); // Timestamp Unix en secondes

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
            invoice_id: `invoice_hello_order_${currentTimestamp}`,
            amount: {
              currency_code: 'EUR',
              value: amount
            }
          }
        ],
        application_context: {
          return_url: 'https://example.com',
          cancel_url: 'https://example.com',
          user_action: "PAY_NOW"
        }
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


app.all('/getOrder/:orderId', async (req, res) => {
  try {
    let orderIdToSend = req.params.orderId;

    const accessToken = await getPayPalAccessToken();

    const response = await axios({
      method: 'get',
      url: `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderIdToSend}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({
      status: 'success',
      order: response.data
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ordre:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Capture / Authorize
app.all('/actionOrder/:orderId/:intent', async (req, res) => {
  try {
    let orderIdToSend = req.params.orderId;
    let intentToSend = req.params.intent;

    const accessToken = await getPayPalAccessToken();

    const response = await axios({
      method: 'post',
      url: `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderIdToSend}/${intentToSend}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({
      status: 'success',
      order: response.data
    });
  } catch (error) {
    console.error('Erreur lors de la capture/authorisation de l\'ordre:', error.message);
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
