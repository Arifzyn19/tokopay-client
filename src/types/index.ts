/**
 * Order item details interface
 */
export interface OrderItem {
  product_code: string;
  name: string;
  price: number;
  product_url?: string;
  image_url?: string;
}

/**
 * Response interface for order status check
 */
export interface OrderStatusResponse {
  data: {
    other: string;
    panduan_pembayaran: string;
    pay_url: string;
    qr_link: string;
    qr_string: string;
    status: PaymentStatus;
    total_bayar: number;
    total_diterima: number;
    trx_id: string;
  };
  status: string;
}

/**
 * Response interface for order creation
 */
export interface OrderResponse {
  data: {
    nomor_va: string;
    panduan_pembayaran: string;
    pay_url: string;
    total_bayar: number;
    total_diterima: number;
    trx_id: string;
  };
  status: string;
}

/**
 * Payment status types
 */
export type PaymentStatus = "Unpaid" | "Paid" | "Expired" | "Failed";

/**
 * Merchant info response
 */
export interface MerchantInfoResponse {
  balance: number;
  merchant_id: string;
  status: string;
}

/**
 * Withdrawal response
 */
export interface WithdrawalResponse {
  status: string;
  message: string;
  data: {
    amount: number;
    fee: number;
    total: number;
    transaction_id: string;
  };
}

/**
 * Available payment methods
 */
export enum PaymentMethod {
  BRIVA = "BRIVA",
  BNIVA = "BNIVA",
  BSIVA = "BSIVA",
  QRIS = "QRIS",
  DANA = "DANA",
  OVO = "OVO",
  SHOPEEPAY = "SHOPEEPAY",
}

/**
 * Create order parameters interface
 */
export interface CreateOrderParams {
  kodeChannel: PaymentMethod;
  refId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  redirectUrl?: string;
  expiredTs?: number;
  items?: OrderItem[];
}
