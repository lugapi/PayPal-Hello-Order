 # Node.js Server for PayPal - Instructions

## Installation

1. Clone the repository

2. Create `.env` files from .env.example.

3. Modify the `.env` file with your PayPal credentials:
   - Create a developer account on [PayPal Developer](https://developer.paypal.com) if you don't have one already.
   - Create an application to obtain your Client ID and Secret.
   - Replace `your_client_id_paypal` and `your_client_secret_paypal` in the `.env` file with your PayPal credentials.

4. Install dependencies:
   ```bash
   npm install
   ```
   
## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Access the following URL to create a PayPal order with the CAPTURE intention:
   ```
   http://localhost:5501/createOrder/iWantCapture
   ```

3. To create an order with the AUTHORIZE intention, use:
   ```
   http://localhost:5501/createOrder/iWantAuthorize
   ```

4. The server will return a JSON response containing information about the created order, including the order ID and links to complete the payment.

```json
{
  "status": "success",
  "order": {
    "id": "5WA63XXXXXXX1630C",
    "status": "CREATED",
    "links": [
      {
        "href": "https://api.sandbox.paypal.com/v2/checkout/orders/5WA63XXXXXXX1630C",
        "rel": "self",
        "method": "GET"
      },
      {
        "href": "https://www.sandbox.paypal.com/checkoutnow?token=5WA63XXXXXXX1630C",
        "rel": "approve",
        "method": "GET"
      },
      {
        "href": "https://api.sandbox.paypal.com/v2/checkout/orders/5WA63XXXXXXX1630C",
        "rel": "update",
        "method": "PATCH"
      },
      {
        "href": "https://api.sandbox.paypal.com/v2/checkout/orders/5WA63XXXXXXX1630C/authorize",
        "rel": "authorize",
        "method": "POST"
      }
    ]
  }
}
```

## Important Notes

- This server uses the default Sandbox (test) environment of PayPal.
- The amount is set to 10 EUR in the code. To change this behavior, you will need to adapt the route `/createOrder/:intent` code.