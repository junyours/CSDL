import AppLayout from "../../Layouts/AppLayout";
import {
    Row,
    Col,
    Card,
    Typography,
    Space,
    Tag,
    Avatar,
    Badge,
    Divider,
    Button,
} from "antd";
import {
    CheckCircleOutlined,
    BookOutlined,
    NotificationOutlined,
    TeamOutlined,
    CalendarOutlined,
    IdcardOutlined,
    GlobalOutlined,
    AppstoreOutlined,
    ClusterOutlined,
} from "@ant-design/icons";
import { router } from "@inertiajs/react";
import Footer from "../../Components/Footer"

const { Title, Text } = Typography;

export default function Dashboard({ auth, unsettledCount, studentData }) {
    const user = auth?.user;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    const firstName = (studentData?.first_name || "Student").split(" ")[0];

    const enrollment = studentData?.current_enrollment;

    const yearSection = enrollment?.year_section;
    const schoolYear = yearSection?.school_year;
    const course = yearSection?.course;
    const yearLevel = yearSection?.year_level;

    const tileStyle = {
        width: "100%",
        height: 95,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    };

    const iconBox = {
        width: 40,
        height: 40,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const iconStyle = {
        color: "#fff",
        fontSize: 18,
    };

    const labelStyle = {
        fontSize: 11,
        textAlign: "center",
    };

    return (
        <AppLayout user={user}>
            <div style={{ padding: 16, maxWidth: 768, margin: "0 auto" }}>

                {/* HEADER */}
                <div style={{ padding: 12 }}>
                    <Title level={4} style={{ marginBottom: 0, fontWeight: "900" }}>
                        {greeting},{" "}
                        <span style={{ color: "#1677ff" }}>{firstName}</span>
                    </Title>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: "5px" }} />
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </Text>
                </div>

                <Divider />


                <Row gutter={[8, 12]}>
                    {/* APP ITEM */}
                    <Col span={6}>
                        <Button
                            type="text"
                            onClick={() => window.open("https://sis.occph.com/", "_blank")}
                            style={tileStyle}
                        >
                            <div style={{ ...iconBox, background: "#1677ff" }}>
                                <BookOutlined style={iconStyle} />
                            </div>
                            <Text style={labelStyle}>SIS Portal</Text>
                        </Button>
                    </Col>

                    {/* APP 2 */}
                    <Col span={6}>
                        <Button
                            type="text"
                            onClick={() => window.open("https://occ.edu.ph/news", "_blank")}
                            style={tileStyle}
                        >
                            <div style={{ ...iconBox, background: "#cb3600" }}>
                                <GlobalOutlined style={iconStyle} />
                            </div>
                            <Text style={labelStyle}>News</Text>
                        </Button>
                    </Col>

                    {/* APP 3 */}
                    <Col span={6}>
                        <Button
                            type="text"
                            onClick={() => router.visit('/student/digital-id')}
                            style={tileStyle}
                        >
                            <div style={{ ...iconBox, background: "#07933d" }}>
                                <IdcardOutlined style={iconStyle} />
                            </div>
                            <Text style={labelStyle}>Digital ID</Text>
                        </Button>
                    </Col>

                    {/* APP 4 */}
                    <Col span={6}>
                        <Button
                            type="text"
                            onClick={() => router.visit('/student/my-clubs')}
                            style={tileStyle}
                        >
                            <div style={{ ...iconBox, background: "#722ed1" }}>
                                <ClusterOutlined style={iconStyle} />
                            </div>
                            <Text style={labelStyle}>Clubs</Text>
                        </Button>
                    </Col>
                </Row>

                {/* MAIN STACK (MOBILE FIRST) */}
                <Space direction="vertical" size={16} style={{ width: "100%" }}>

                    {/* ENROLLMENT CARD */}
                    <Card
                        size="small"
                        style={{
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #1e293b, #3b82f6)", // dark blue gradient
                        }}
                        title={
                            <Text style={{ color: "#fff" }}>
                                {schoolYear?.start_year} - {schoolYear?.end_year}
                            </Text>
                        }
                        extra={
                            enrollment && (
                                <Space size={4} wrap>
                                    <Tag color="success">
                                        {schoolYear?.semester?.semester_name} {" Semester"}
                                    </Tag>
                                </Space>
                            )
                        }
                    >
                        {enrollment ? (
                            <>
                                <Title level={5} style={{ marginBottom: 4, color: "#fff" }}>
                                    {course?.course_name_abbreviation}
                                </Title>

                                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                                    {course?.department?.department_name}
                                </Text>

                                <Divider style={{ margin: "12px 0", borderColor: "rgba(255,255,255,0.2)" }} />

                                <Space size={8} wrap>
                                    <Tag icon={<TeamOutlined />} color="blue">
                                        {yearLevel?.year_level_name}
                                    </Tag>

                                    <Tag>
                                        Section {yearSection?.section}
                                    </Tag>
                                </Space>
                            </>
                        ) : (
                            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                                No active enrollment found.
                            </Text>
                        )}
                    </Card>

                    {/* VIOLATION STATUS */}
                    <Card
                        size="medium"
                        hoverable
                        onClick={() => router.visit('/student/violations')}
                    >
                        <Space align="center" style={{ width: "100%" }}>
                            <Badge size="small" count={unsettledCount} overflowCount={99}>
                                <Avatar
                                    size={45}
                                    style={{
                                        backgroundColor:
                                            unsettledCount > 0 ? "#ff4d4f" : "#52c41a",
                                    }}
                                    icon={
                                        unsettledCount > 0 ? (
                                            <NotificationOutlined />
                                        ) : (
                                            <CheckCircleOutlined />
                                        )
                                    }
                                />
                            </Badge>

                            <div  className="ml-4">
                                <Text strong>
                                    {unsettledCount > 0
                                        ? "Action Required"
                                        : "No violations"}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {unsettledCount > 0
                                        ? "You have pending violations."
                                        : "You're doing great!"}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Space>

                <Footer />
            </div>
        </AppLayout >
    );
}