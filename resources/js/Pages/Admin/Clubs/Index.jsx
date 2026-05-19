import { useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    Card,
    Grid,
    Typography,
    Avatar,
    Space,
    Tag,
    Table,
} from "antd";
import { TeamOutlined } from "@ant-design/icons";
import Show from "./Show";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Index({ auth, clubs: initialClubs }) {
    const user = auth?.user;
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [open, setOpen] = useState(false);
    const [selectedClubId, setSelectedClubId] = useState(null);
    const [clubs, setClubs] = useState(initialClubs);

    const handleView = (clubId) => {
        setSelectedClubId(clubId);
        setOpen(true);
    };

    const columns = [
        {
            title: "Club",
            dataIndex: "club_name",
            key: "club_name",
            render: (_, club) => (
                <Space>
                    <Avatar
                        src={
                            club.club_logo_path
                                ? `https://lh3.googleusercontent.com/d/${club.club_logo_path}`
                                : null
                        }
                    />
                    <Text strong>{club.club_name}</Text>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag
                    color={
                        status === "Activated"
                            ? "green"
                            : status === "Deactivated"
                                ? "red"
                                : "default"
                    }
                >
                    {status}
                </Tag>
            ),
            filters: [
                { text: "Activated", value: "Activated" },
                { text: "Deactivated", value: "Deactivated" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Members",
            dataIndex: "members_count",
            key: "members_count",
            sorter: (a, b) => a.members_count - b.members_count,
            render: (count) => (
                <Text>
                    <TeamOutlined /> {count}
                </Text>
            ),
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Clubs"]}>
            <div
                style={{
                    padding: isMobile ? 12 : 24,
                    maxWidth: 1200,
                    margin: "0 auto",
                }}
            >
                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                        Clubs & Organizations
                    </Title>
                    <Text type="secondary">
                        Manage and configure student organizations
                    </Text>
                </Card>

                {/* TABLE */}
                <Card style={{ borderRadius: 12 }}>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={clubs}
                        onRow={(record) => ({
                            onClick: () => handleView(record.id),
                            style: { cursor: "pointer" },
                        })}
                    />
                </Card>

                {/* DRAWER */}
                <Show
                    open={open}
                    onClose={() => setOpen(false)}
                    clubId={selectedClubId}
                    setClubs={setClubs}
                />
            </div>
        </AppLayout>
    );
}