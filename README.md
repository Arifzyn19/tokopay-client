# Tokopay TypeScript Client

A TypeScript client for interacting with the Tokopay payment gateway API. This client provides easy-to-use methods for creating orders, checking order status, and managing your merchant account.

## Installation

```bash
npm install tokopay-ts
# or
yarn add tokopay-ts
```

## Usage

### Initialize the Client

```typescript
import Tokopay from "tokopay-ts";

const tokopay = new Tokopay("YOUR_MERCHANT_ID", "YOUR_SECRET");
```

### Check Merchant Balance

```typescript
const merchantInfo = await tokopay.info();
console.log("Current Balance:", merchantInfo.balance);
```

### Create Simple Order

Use this method for quick order creation with minimal parameters:

```typescript
// Simple order creation
const simpleOrder = await tokopay.simpleOrder(
  "REF123", // Your unique reference ID
  "BRIVA", // Payment method code
  25000, // Amount in IDR
);

console.log("Payment URL:", simpleOrder.pay_url);
console.log("Total Amount:", simpleOrder.total_bayar);
```

### Create Complete Order

Use this method when you need more control over the order details:

```typescript
// Complete order with all parameters
const orderItems = [
  {
    product_code: "PROD-001",
    name: "Gaming Mouse",
    price: 250000,
    product_url: "https://yourstore.com/gaming-mouse",
    image_url: "https://yourstore.com/images/gaming-mouse.jpg",
  },
];

const order = await tokopay.createOrder(
  "BRIVA", // Payment channel code
  "ORDER-123", // Your unique reference ID
  250000, // Amount in IDR
  "John Doe", // Customer name
  "johndoe@example.com", // Customer email
  "081234567890", // Customer phone
  "https://yourstore.com/return", // Return URL (optional)
  0, // Expiry time (0 for 24h default)
  orderItems, // Order items (optional)
);

console.log("Virtual Account:", order.data.nomor_va);
console.log("Payment URL:", order.data.pay_url);
console.log("Amount:", order.data.total_bayar);
```

### Check Order Status

Monitor the payment status of your orders:

```typescript
const orderStatus = await tokopay.checkOrderStatus(
  "ORDER-123", // Your reference ID
  "BRIVA", // Payment method used
  250000, // Order amount
);

console.log("Payment Status:", orderStatus.data.status);
console.log("Payment Instructions:", orderStatus.data.panduan_pembayaran);
console.log("Transaction ID:", orderStatus.data.trx_id);

// Check if payment is completed
if (orderStatus.data.status === "Paid") {
  console.log("Payment has been received!");
}
```

### Withdraw Balance

Withdraw funds from your merchant account:

```typescript
const withdrawal = await tokopay.tarikSaldo(1000000); // Amount in IDR
console.log("Withdrawal Status:", withdrawal.status);
```

## Payment Method Codes

Common payment method codes you can use:

- `BRIVA` - BRI Virtual Account
- `BNIVA` - BNI Virtual Account
- `BSIVA` - BSI Virtual Account
- `QRIS` - QRIS Payment
- `DANA` - DANA
- `OVO` - OVO
- `SHOPEEPAY` - ShopeePay

See Docs For Detail Payment Method [Tokopay Documentation](https://docs.tokopay.id/persiapan-awal/metode-pembayaran).

## Response Types

### Order Status Response

```typescript
interface OrderStatusResponse {
  data: {
    other: string;
    panduan_pembayaran: string; // Payment instructions
    pay_url: string; // Payment page URL
    qr_link: string; // QR code image URL (if applicable)
    qr_string: string; // QR code string (if applicable)
    status: "Unpaid" | "Paid" | "Expired" | "Failed";
    total_bayar: number; // Total amount to pay
    total_diterima: number; // Amount received after fees
    trx_id: string; // Transaction ID
  };
  status: string;
}
```

### Order Response

```typescript
interface OrderResponse {
  data: {
    nomor_va: string; // Virtual account number
    panduan_pembayaran: string; // Payment instructions
    pay_url: string; // Payment page URL
    total_bayar: number; // Total amount to pay
    total_diterima: number; // Amount received after fees
    trx_id: string; // Transaction ID
  };
  status: string;
}
```

## Error Handling

The client includes proper error handling. Here's how to handle potential errors:

```typescript
try {
  const order = await tokopay.createOrder(/* ... */);
  // Process successful order
} catch (error) {
  console.error("Failed to create order:", error.message);
  // Handle error appropriately
}
```

## Development

### Building the Project

```bash
npm run build
# or
yarn build
```

### Running Tests

```bash
npm test
# or
yarn test
```

## License

[MIT](https://github.com/Arifzyn19/tokopay-client/blob/master/LICENSE)

## Support

For support, please contact support@tokopay.id or visit [Tokopay Documentation](https://docs.tokopay.id).

---

Remember to replace `'YOUR_MERCHANT_ID'` and `'YOUR_SECRET'` with your actual Tokopay credentials.

## LICENSE

This project is licensed under the MIT License - see the LICENSE file for details.
