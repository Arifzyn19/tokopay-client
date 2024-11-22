const { Tokopay } = require("../dist/cjs");

// Test configuration
const merchant = "YOUR_MERCHANT";
const secret = "YOUR_SECRET";
const tokopay = new Tokopay(merchant, secret);

async function runTests() {
  console.log("Starting Tokopay Tests...\n");
  /*
    // Test 1: Get Merchant Info
    try {
        console.log("Test 1: Getting Merchant Info");
        const info = await tokopay.info();
        console.log("✅ Merchant Info Success:", info);
    } catch (error) {
        console.log("❌ Merchant Info Failed:", error.message);
    }

    
    // Test 2: Simple Order
    try {
        console.log("\nTest 2: Creating Simple Order");
        const refId = `ORDER-${Date.now()}`; // Unique reference ID
        const metode = "GOPAY";  // Payment method
        const nominal = 100;   // Amount in IDR

        const order = await tokopay.simpleOrder(refId, metode, nominal);
        console.log("✅ Simple Order Success:", order);
    } catch (error) {
        console.log("❌ Simple Order Failed:", error.message);
    }
    */
  // Test 3: Check Order Status
  try {
    console.log("\nTest 3: Checking Order Status");
    const refId = "TP241122SKCV021417"; // Use an existing order reference
    const metode = "GOPAY";
    const nominal = 100;

    const status = await tokopay.checkOrderStatus(refId, metode, nominal);
    console.log("✅ Check Status Success:", status);
  } catch (error) {
    console.log("❌ Check Status Failed:", error.message);
  }

  /*
    // Test 4: Create Complete Order
    try {
        console.log("\nTest 4: Creating Complete Order");
        const orderData = {
            kodeChannel: "DANA",
            refId: `FULL-ORDER-${Date.now()}`,
            amount: 100,
            customerName: "John Doe",
            customerEmail: "john@example.com",
            customerPhone: "081234567890",
            redirectUrl: "https://your-website.com/callback",
            expiredTs: Math.floor(Date.now() / 1000) + 3600, // Expired in 1 hour
            items: [
                {
                    name: "Test Product",
                    price: 15000,
                    quantity: 1
                }
            ]
        };

        const completeOrder = await tokopay.createOrder(orderData);
        console.log("✅ Complete Order Success:", completeOrder);
    } catch (error) {
        console.log("❌ Complete Order Failed:", error.message);
    }

    // Test 5: Withdraw Balance
    try {
        console.log("\nTest 5: Testing Withdraw Balance");
        const withdrawAmount = 50000;
        const withdraw = await tokopay.tarikSaldo(withdrawAmount);
        console.log("✅ Withdraw Success:", withdraw);
    } catch (error) {
        console.log("❌ Withdraw Failed:", error.message);
    }
    */
}

// Run all tests
console.log("=".repeat(50));
console.log("TOKOPAY API TEST");
console.log("=".repeat(50));

runTests().catch((error) => {
  console.error("Test execution failed:", error);
});

// Helper function to wait between tests if needed
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
