import {
    Avatar,
    Card,
    Divider,
    Typography,
    Popover,
    Image,
    Space
} from "antd";

import {
    CoffeeOutlined,
    HeartFilled
} from "@ant-design/icons";

const { Text, Title } = Typography;

export default function Footer() {

    const popoverContent = (
        <div
            style={{
                maxWidth: 240,
                textAlign: "center"
            }}
        >
            <Text
                style={{
                    fontSize: 12,
                    display: "block",
                    marginBottom: 12
                }}
            >
                If my innovation helped, fuel the next one with coffee ☕
            </Text>

            {/* QR CODE */}
            <Image
                src="../assets/images/0936bcb8-dc50-4c75-832b-b532ef0c35a9.jpg"
                alt="GCash QR"
                preview={false}
                width={120}
                style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    marginBottom: 10
                }}
            />

            <Space
                direction="vertical"
                size={0}
                style={{ width: "100%" }}
            >
                <Text
                    type="secondary"
                    style={{
                        fontSize: 12
                    }}
                >
                    Buy Coffee to Support
                </Text>
            </Space>
        </div>
    );

    return (
        <>
            <Divider titlePlacement="center">
                <Text type="secondary" style={{ fontSize: "10px" }}>
                    Meet the Developer
                </Text>
            </Divider>

            {/* Avatar */}
            <Popover
                content={popoverContent}
                trigger="hover"
            >

                <Card type="inner">
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "flex-start"
                        }}
                    >


                        <Avatar
                            size={44}
                            src="../assets/images/developer_profile.jpg"
                        />

                        {/* Right Content */}
                        <div style={{ flex: 1 }}>
                            <Title
                                level={5}
                                style={{
                                    margin: 0,
                                    fontSize: 13
                                }}
                            >
                                Lance Dominic S. Labis
                            </Title>

                            <Text
                                type="secondary"
                                style={{
                                    display: "block",
                                    marginBottom: 8,
                                    fontSize: 12
                                }}
                            >
                                2022 - 2026
                            </Text>
                        </div>
                    </div>

                    {/* Description */}
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 11,
                            display: "block",
                            fontStyle: "italic",
                            textAlign: "justify"
                        }}
                    >
                        An OCCian BSIT enthusiast committed to giving back to the community through innovation.
                    </Text>
                </Card>

            </Popover>


            <Divider titlePlacement="center">
                <Text type="secondary" style={{ fontSize: "9px" }}>
                    © {new Date().getFullYear()} CSDL App. All rights reserved.
                </Text>
            </Divider>
        </>
    );
}