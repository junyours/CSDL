import { useEffect, useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    Row,
    Col,
    Card,
    Statistic,
    Avatar,
    List,
    Tag,
    Progress,
    Typography,
    Divider,
    Space,
    Badge,
} from "antd";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    UserOutlined,
    WarningOutlined,
    TrophyOutlined,
    NotificationOutlined,
} from "@ant-design/icons";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const { Title, Text } = Typography;

// Counter animation
const useCountUp = (end, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end]);

    return count;
};

const DEPARTMENT_COLORS = {
    DIT: "#1677ff",
    CBA: "#52c41a",
    CCS: "#faad14",
};

export default function Dashboard({ auth, unsettledViolations, totalUsers }) {
    const user = auth?.user;

    const activeUsers = useCountUp(420);
    const violations = useCountUp(237);

    const progressUsers = totalUsers
        ? Math.round((activeUsers / totalUsers) * 100)
        : 0;

    const COLORS = ["#1677ff", "#52c41a", "#faad14"];

    const departments = [
        { department: "DIT", total: 200 },
        { department: "CBA", total: 250 },
        { department: "CCS", total: 150 },
    ];

    const violationsData = [
        { department: "DIT", total_violation_record: 125 },
        { department: "CBA", total_violation_record: 80 },
        { department: "CCS", total_violation_record: 32 },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Dashboard"]}>
            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <Title level={3}>Dashboard Overview</Title>
                    <Title level={5} type="secondary" style={{ marginTop: -10 }}>
                        Summary of key metrics and system activity
                    </Title>
                </div>

                {/* KPI */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card bordered={false} hoverable>
                            <Statistic
                                title="Total Users"
                                value={totalUsers}
                                prefix={<UserOutlined />}
                            />
                            <Progress percent={100} showInfo={false} />
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card bordered={false} hoverable>
                            <Statistic
                                title="Active Users"
                                value={activeUsers}
                                valueStyle={{ color: "#3f8600" }}
                                prefix={<ArrowUpOutlined />}
                            />
                            <Progress percent={progressUsers} status="active" />
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card bordered={false} hoverable>
                            <Statistic
                                title="Unsettled Violations"
                                value={unsettledViolations}
                                valueStyle={{ color: "#cf1322" }}
                                prefix={<WarningOutlined />}
                            />
                            <Progress percent={unsettledViolations} status="exception" />
                        </Card>
                    </Col>
                </Row>

                {/* CHARTS */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                        <Card title="Active Users per Department" bordered={false}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departments}>
                                    <XAxis dataKey="department" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                        {departments.map((entry) => (
                                            <Cell
                                                key={entry.department}
                                                fill={DEPARTMENT_COLORS[entry.department]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Unsettled Violations per Department" bordered={false}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={violationsData}
                                        dataKey="total_violation_record"
                                        nameKey="department"
                                        outerRadius={100}
                                        label
                                    >
                                        {violationsData.map((entry) => (
                                            <Cell
                                                key={entry.department}
                                                fill={DEPARTMENT_COLORS[entry.department]}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </div>
        </AppLayout>
    );
}