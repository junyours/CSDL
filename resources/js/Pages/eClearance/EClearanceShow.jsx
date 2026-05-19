import React from "react";
import AppLayout from "../../Layouts/AppLayout";

import {
    Card,
    Typography,
    Space,
    Row,
    Col,
    Tag,
    Divider,
    Button,
} from "antd";

import {
    FolderFilled,
    CheckCircleFilled,
    CloseCircleFilled,
    ArrowLeftOutlined,
} from "@ant-design/icons";

import { router } from "@inertiajs/react";

const { Title, Text } = Typography;

export default function EClearanceShow({ auth, eClearance }) {

    const user = auth?.user;

    return (
        <AppLayout
            user={user}
            breadcrumbs={[
                "Manage",
                "e-Clearance",
                `#${eClearance.id}`
            ]}
        >
            <div
                style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    padding: 24,
                }}
            >

                {/* TOP BAR */}
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 20 }}
                >
                    <Col>
                        <Space align="center">
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    A.Y. {eClearance.school_year?.start_year}-
                                    {eClearance.school_year?.end_year}
                                </Title>

                                <Text type="secondary">
                                    {eClearance.school_year?.semester?.semester_name} Semester
                                </Text>
                            </div>
                        </Space>
                    </Col>

                    <Col>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.visit("/e-clearance")}
                        >
                            Back
                        </Button>
                    </Col>
                </Row>

                {/* MAIN CARD */}
                <Card
                    style={{
                        borderRadius: 20,
                    }}
                >
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: "100%" }}
                    >

                        {/* HEADER */}
                        <Row
                            justify="space-between"
                            align="middle"
                        >

                            <Col>
                                {eClearance.is_active ? (
                                    <Tag
                                        color="success"
                                        icon={<CheckCircleFilled />}
                                    >
                                        Active
                                    </Tag>
                                ) : (
                                    <Tag
                                        color="default"
                                        icon={<CloseCircleFilled />}
                                    >
                                        Inactive
                                    </Tag>
                                )}
                            </Col>
                        </Row>

                        <Divider />

                    </Space>
                </Card>
            </div>
        </AppLayout>
    );
}