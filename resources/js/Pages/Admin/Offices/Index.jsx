import React from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import {
    Button,
    Card,
    Col,
    Row,
    Modal,
    Typography,
    Tag,
    Space,
    Input,
    Grid,
    Divider,
    Empty,
} from "antd";

import {
    PlusOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;



export default function AdminIndex({ auth }) {
    const user = auth?.user;

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Offices"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle" gutter={[12, 12]}>
                        <Col xs={24} md={12}>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Manage Offices
                            </Title>
                            <Text type="secondary">
                                Configure and manage campus offices
                            </Text>
                        </Col>

                        <Col xs={24} md={12} style={{ textAlign: isMobile ? "left" : "right" }}>
                            <Space wrap>
                                <Input.Search
                                    placeholder="Search office..."
                                    allowClear
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ width: 220 }}
                                />

                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                >
                                    Create New
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </div>
        </AppLayout>
    );
}