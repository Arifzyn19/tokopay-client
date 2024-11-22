import crypto from "crypto";
import rp from "request-promise-native";
import md5 from "md5";
import {
  OrderItem,
  OrderStatusResponse,
  OrderResponse,
  MerchantInfoResponse,
  WithdrawalResponse,
  PaymentMethod,
  CreateOrderParams,
} from "./types";

// Custom error types
enum ErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  ORDER_ERROR = "ORDER_ERROR",
  WITHDRAWAL_ERROR = "WITHDRAWAL_ERROR",
  MERCHANT_ERROR = "MERCHANT_ERROR",
  EMPTY_RESPONSE = "EMPTY_RESPONSE",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

interface ErrorResponse {
  status: string;
  message: string;
  code: string;
  data?: any;
}

class TokopayError extends Error {
  status: string;
  code: ErrorCode | string;
  details: any;

  constructor(
    message: string,
    status: string,
    code: ErrorCode | string,
    details?: any,
  ) {
    super(message);
    this.name = "TokopayError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class Tokopay {
  private _merchant: string;
  private _secret: string;
  private _endpoint: string;
  private _debug: boolean;

  /**
   * @param {string} merchant - Merchant ID
   * @param {string} secret - Secret Key
   * @param {boolean} debug - Enable debug mode for detailed logging
   **/
  constructor(merchant: string, secret: string, debug: boolean = false) {
    if (!merchant || !secret) {
      throw new TokopayError(
        "Merchant ID and Secret Key are required",
        "Error",
        ErrorCode.VALIDATION_ERROR,
      );
    }
    this._merchant = merchant;
    this._secret = secret;
    this._endpoint = "https://api.tokopay.id";
    this._debug = debug;
  }

  private log(...args: any[]) {
    if (this._debug) {
      console.log("[Tokopay Debug]", ...args);
    }
  }

  private validateAmount(amount: number): void {
    if (isNaN(amount) || amount <= 0) {
      throw new TokopayError(
        "Invalid amount. Amount must be a positive number",
        "Error",
        ErrorCode.VALIDATION_ERROR,
      );
    }
  }

  private validateRefId(refId: string): void {
    if (!refId || typeof refId !== "string") {
      throw new TokopayError(
        "Invalid reference ID. Reference ID must be a non-empty string",
        "Error",
        ErrorCode.VALIDATION_ERROR,
      );
    }
  }

  private validatePaymentMethod(method: PaymentMethod): void {
    const validMethods = [
      "BRIVA",
      "BCAVA",
      "BNIVA",
      "MANDIRIVA",
      "PERMATAVA",
      "PERMATAVAA",
      "CIMBVA",
      "DANAMONVA",
      "BSIVA",
      "BNCVA",
      "TELKOMSEL",
      "AXIS",
      "XL",
      "TRI",
      "SHOPEEPAY",
      "GOPAY",
      "DANA",
      "LINKAJA",
      "QRIS",
      "QRISREALTIME",
      "QRIS_REALTIME_NOBU",
    ];
    if (!validMethods.includes(method)) {
      throw new TokopayError(
        `Invalid payment method. Valid methods are: ${validMethods.join(", ")}`,
        "Error",
        ErrorCode.VALIDATION_ERROR,
      );
    }
  }

  private async handleRequest<T>(options: rp.OptionsWithUri): Promise<T> {
    try {
      this.log("Making request with options:", options);
      const response = await rp(options);
      this.log("Received response:", response);

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof TokopayError) {
        throw error;
      }

      if (error.statusCode) {
        switch (error.statusCode) {
          case 401:
            throw new TokopayError(
              "Authentication failed",
              "Error",
              ErrorCode.AUTHENTICATION_ERROR,
              error,
            );
          case 400:
            throw new TokopayError(
              "Invalid request parameters",
              "Error",
              ErrorCode.VALIDATION_ERROR,
              error,
            );
          case 404:
            throw new TokopayError(
              "Resource not found",
              "Error",
              ErrorCode.ORDER_ERROR,
              error,
            );
          default:
            throw new TokopayError(
              "Request failed",
              "Error",
              ErrorCode.NETWORK_ERROR,
              error,
            );
        }
      }

      throw new TokopayError(
        error.message || "Network request failed",
        "Error",
        ErrorCode.NETWORK_ERROR,
        error,
      );
    }
  }

  private handleResponse<T>(response: any): T {
    if (!response) {
      throw new TokopayError(
        "Empty response received",
        "Error",
        ErrorCode.EMPTY_RESPONSE,
      );
    }

    if (response.status !== "Success") {
      const errorResponse: ErrorResponse = {
        status: response.status || "Error",
        message: response.message || "Request failed",
        code: response.code || ErrorCode.UNKNOWN_ERROR,
        data: response.data,
      };
      return errorResponse as unknown as T;
    }

    if (!response.data && response.status === "Success") {
      throw new TokopayError(
        "Response data is missing",
        "Error",
        ErrorCode.INVALID_RESPONSE,
      );
    }

    return response.data;
  }

  /**
   * Get merchant account information
   */
  async info(): Promise<MerchantInfoResponse> {
    const signature = md5(`${this._merchant}:${this._secret}`);

    const options = {
      method: "GET",
      uri: `${this._endpoint}/v1/merchant/balance`,
      qs: {
        merchant: this._merchant,
        signature,
      },
      json: true,
    };

    return this.handleRequest<MerchantInfoResponse>(options);
  }

  /**
   * Check order status
   * @param {string} refId - Your reference ID
   * @param {PaymentMethod} metode - Payment method code
   * @param {number} nominal - Payment amount
   */
  async checkOrderStatus(
    refId: string,
    metode: PaymentMethod,
    nominal: number,
  ): Promise<OrderStatusResponse> {
    // Validate input parameters
    this.validateRefId(refId);
    this.validatePaymentMethod(metode);
    this.validateAmount(nominal);

    const options = {
      method: "GET",
      uri: `${this._endpoint}/v1/order`,
      qs: {
        merchant: this._merchant,
        secret: this._secret,
        ref_id: refId,
        nominal,
        metode,
      },
      json: true,
    };

    return this.handleRequest<OrderStatusResponse>(options);
  }

  /**
   * Simple order method
   * @param {string} refId - Your unique reference ID
   * @param {PaymentMethod} metode - Payment method code
   * @param {number} nominal - Payment amount
   */
  async simpleOrder(
    refId: string,
    metode: PaymentMethod,
    nominal: number,
  ): Promise<OrderResponse> {
    this.validateRefId(refId);
    this.validatePaymentMethod(metode);
    this.validateAmount(nominal);

    const options = {
      method: "GET",
      uri: `${this._endpoint}/v1/order`,
      qs: {
        merchant: this._merchant,
        secret: this._secret,
        ref_id: refId,
        nominal,
        metode,
      },
      json: true,
    };

    return this.handleRequest<OrderResponse>(options);
  }

  /**
   * Create a complete order
   */
  async createOrder({
    kodeChannel,
    refId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    redirectUrl,
    expiredTs = 0,
    items,
  }: CreateOrderParams): Promise<OrderResponse> {
    this.validateRefId(refId);
    this.validatePaymentMethod(kodeChannel);
    this.validateAmount(amount);

    if (!customerName || !customerEmail) {
      throw new TokopayError(
        "Customer name and email are required",
        "Error",
        ErrorCode.VALIDATION_ERROR,
      );
    }

    const signature = md5(`${this._merchant}:${this._secret}:${refId}`);

    const options = {
      method: "POST",
      uri: `${this._endpoint}/v1/order`,
      body: {
        merchant_id: this._merchant,
        kode_channel: kodeChannel,
        reff_id: refId,
        amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        redirect_url: redirectUrl,
        expired_ts: expiredTs,
        signature,
        items,
      },
      json: true,
    };

    return this.handleRequest<OrderResponse>(options);
  }

  /**
   * Withdraw balance from merchant account
   * @param {number} nominal - Amount to withdraw
   */
  async tarikSaldo(nominal: number): Promise<WithdrawalResponse> {
    this.validateAmount(nominal);

    const options = {
      method: "POST",
      uri: `${this._endpoint}/v1/merchant/tarik-saldo`,
      body: {
        nominal,
        merchant_id: this._merchant,
        signature: md5(`${this._merchant}:${this._secret}`),
      },
      json: true,
    };

    return this.handleRequest<WithdrawalResponse>(options);
  }

  /**
   * Retry failed order
   * @param {string} refId - Original reference ID
   */
  async retryOrder(refId: string): Promise<OrderResponse> {
    this.validateRefId(refId);

    const options = {
      method: "POST",
      uri: `${this._endpoint}/v1/order/retry`,
      body: {
        merchant_id: this._merchant,
        ref_id: refId,
        signature: md5(`${this._merchant}:${this._secret}:${refId}`),
      },
      json: true,
    };

    return this.handleRequest<OrderResponse>(options);
  }

  /**
   * Cancel pending order
   * @param {string} refId - Reference ID to cancel
   */
  async cancelOrder(refId: string): Promise<OrderResponse> {
    this.validateRefId(refId);

    const options = {
      method: "POST",
      uri: `${this._endpoint}/v1/order/cancel`,
      body: {
        merchant_id: this._merchant,
        ref_id: refId,
        signature: md5(`${this._merchant}:${this._secret}:${refId}`),
      },
      json: true,
    };

    return this.handleRequest<OrderResponse>(options);
  }
}

export { Tokopay, TokopayError, ErrorCode };
