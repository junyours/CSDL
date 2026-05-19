import AppLayout from "../Layouts/AppLayout";
import {
    Card,
    Typography,
    Space,
    Button,
    Result,
    theme,
    Divider
} from "antd";
import {
    ToolOutlined,
    ReloadOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function Maintenance({ auth }) {
    const user = auth?.user;
    const { token } = theme.useToken();

    return (
        <AppLayout user={user} breadcrumbs={["Under Maintenance"]}>
            <div
                style={{
                    minHeight: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                }}
            >
                <Card
                    style={{
                        width: "100%",
                        maxWidth: 520,
                        borderRadius: token.borderRadiusLG,
                        textAlign: "center",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    }}
                    bodyStyle={{ padding: 32 }}
                >
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>

                        {/* Icon with soft background */}
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                margin: "0 auto",
                                borderRadius: "50%",
                                background: `${token.colorPrimary}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ToolOutlined
                                style={{
                                    fontSize: 36,
                                    color: token.colorPrimary,
                                }}
                            />
                        </div>

                        {/* Title */}
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Currently Unavailable
                        </Title>

                        {/* Message */}
                        <Paragraph
                            type="secondary"
                            style={{
                                marginBottom: 0,
                                fontSize: 14,
                                lineHeight: 1.6,
                            }}
                        >
                            We're currently updating and improving this feature to provide a better experience.
                            It will be available again shortly. Thank you for your patience.
                        </Paragraph>

                        {/* Divider for visual separation */}
                        <Divider style={{ margin: "12px 0" }} />

                        {/* Actions */}
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            <Button
                                type="primary"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </Button>
                        </Space>

                    </Space>
                </Card>
            </div>
        </AppLayout>
    );
}