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

interface BroadcastEmailProps {
    subject: string;
    message: string;
}

export const BroadcastEmail = ({ subject, message }: BroadcastEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{subject}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            {subject}
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {message}
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                This is an automated announcement from Novexa.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
