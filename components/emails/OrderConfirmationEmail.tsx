import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import { formatCurrency } from "@/lib/formatters";

interface OrderConfirmationEmailProps {
    orderId: string;
    amount: number;
}

export const OrderConfirmationEmail = ({
    orderId,
    amount,
}: OrderConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Order Confirmation - {orderId}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Order Confirmed!
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thank you for your order. We have received your payment and are processing your order.
                        </Text>
                        <Section className="bg-gray-100 p-4 rounded-lg my-4">
                            <Text className="text-black text-[14px] m-0">
                                <strong>Order ID:</strong> {orderId}
                            </Text>
                            <Text className="text-black text-[14px] m-0 mt-2">
                                <strong>Total Amount:</strong> {formatCurrency(amount / 100)}
                            </Text>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            We will notify you once your order has been shipped.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
