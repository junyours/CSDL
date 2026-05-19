import { Card, Tag, Space, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ClubCard({ club, onManage }) {
    const bgImage = club?.club_logo
        ? `https://lh3.googleusercontent.com/d/${club.club_logo}`
        : null;

    return (
        <Card
            hoverable
            onClick={() => onManage?.(club)}
            style={{
                borderRadius: 16,
                overflow: "hidden",
                height: 220,
            }}
            styles={{
                body: {
                    padding: 0,
                    height: "100%",
                },
            }}
            cover={
                <div
                    style={{
                        height: 220,
                        position: "absolute",
                        width: "100%",
                        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(14px)",
                        transform: "scale(1.1)",
                    }}
                />
            }
        >
            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.85))",
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 16,
                }}
            >
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Tag color={club?.status === "Activated" ? "green" : club?.status === "Deactivated" ? "red" : "orange"}>
                        {club?.status || "Pending"}
                    </Tag>
                </Space>

                <div style={{ textAlign: "center" }}>
                    <Title
                        level={4}
                        style={{
                            color: "#fff",
                            margin: 0,
                            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                        }}
                    >
                        {club?.club_name}
                    </Title>
                </div>

                <div style={{ textAlign: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                        <TeamOutlined /> {club?.members_count ?? 0} people
                    </Text>
                </div>
            </div>
        </Card>
    );
}