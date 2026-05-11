import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? '',
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const deleteAllRazorpayCustomers = async () => {
    try {
        let skip = 0;
        const count = 100;

        while (true) {
            const customers = await razorpay.customers.all({
                count,
                skip,
            });

            if (!customers.items.length) {
                break;
            }

            for (const customer of customers.items) {
                console.log(`Processing customer: ${customer.id}`);

                try {
                    // Fetch subscriptions for this customer
                    const subscriptions = await razorpay.subscriptions.all({
                        count: 100,
                    });

                    const customerSubscriptions = subscriptions.items.filter(
                        (sub) => sub.customer_id === customer.id,
                    );

                    // Cancel subscriptions
                    for (const subscription of customerSubscriptions) {
                        try {
                            if (
                                subscription.status !== 'cancelled' &&
                                subscription.status !== 'completed'
                            ) {
                                console.log(
                                    `Cancelling subscription: ${subscription.id}`,
                                );

                                await razorpay.subscriptions.cancel(
                                    subscription.id,
                                    0,
                                );

                                await sleep(300);
                            }
                        } catch (subError) {
                            console.error(
                                `Failed cancelling subscription ${subscription.id}`,
                                subError,
                            );
                        }
                    }

                    // Razorpay DOES NOT support deleting customers.
                    // You should instead:
                    // 1. Remove customer from your DB
                    // 2. Mark as deleted/inactive locally

                    console.log(
                        `Customer ${customer.id} cannot be deleted from Razorpay.`,
                    );

                    await sleep(300);
                } catch (customerError) {
                    console.error(
                        `Failed processing customer ${customer.id}`,
                        customerError,
                    );
                }
            }

            skip += count;
        }

        console.log('Finished processing all customers.');
    } catch (error) {
        console.error('Fatal error:', error);
    }
};

deleteAllRazorpayCustomers();
