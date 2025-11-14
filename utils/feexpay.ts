import Feexpay from "@feexpay/react-sdk";

export const initFeexpayPayment = async (paymentData: any) => {
    const feexpay = new Feexpay({
        public_key: paymentData.public_key,
        reference: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency || "XOF",
        customer: {
            name: paymentData.customer_name,
            email: paymentData.customer_email,
            phone_number: paymentData.customer_phone,
        },
        callback_url: paymentData.callback_url,
    });

    feexpay.open();
};
