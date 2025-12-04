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

interface DeliveryEmailProps {
    orderId: string;
}

export const DeliveryEmail = ({ orderId }: DeliveryEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Order has been Delivered!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Order Delivered
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Great news! Your order has been delivered.
                        </Text>
                        <Section className="bg-gray-100 p-4 rounded-lg my-4">
                            <Text className="text-black text-[14px] m-0">
                                <strong>Order ID:</strong> {orderId}
                            </Text>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            We hope you enjoy your purchase. Thank you for shopping with Novexa!
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
