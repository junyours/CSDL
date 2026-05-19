import AppLayout from "@/Layouts/AppLayout";
import { Typography, Card, Button, Input, Divider, Avatar } from "antd";
import { CalendarOutlined, FileTextOutlined, ScanOutlined, SearchOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { useState } from "react";
import QrScannerDrawer from "./components/QrScannerDrawer";
import { Divide } from "lucide-react";
import Footer from "../../../Components/Footer";
import ShowResult from "./components/ShowResult";

const { Title, Text } = Typography;

const { Search } = Input;

export default function Index({ auth, totalIssuedTicketToday, userInformation }) {
    const [openScanner, setOpenScanner] = useState(false);

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    const firstName = (userInformation?.first_name || "Security").split(" ")[0];

    const [searchValue, setSearchValue] = useState("");
    const [openResult, setOpenResult] = useState(false);

    const [ticketCount, setTicketCount] = useState(totalIssuedTicketToday);

    return (
        <AppLayout user={auth.user}>

            <div style={{ padding: 16, maxWidth: 768, margin: "0 auto" }}>

                {/* HEADER */}
                <div style={{ padding: 6 }}>
                    <Title level={3} style={{ marginBottom: 0, fontWeight: "900" }}>
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

                <Search
                    allowClear
                    placeholder="Search..."
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={(value) => {
                        if (!value) return;
                        setSearchValue(value);
                        setOpenResult(true); // open drawer
                    }}
                    style={{ marginBottom: 20 }}
                />

                <Card
                    style={{
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #1677ff, #4096ff)",
                        color: "#fff",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* BACKGROUND ICON */}
                    <FileTextOutlined
                        style={{
                            position: "absolute",
                            right: -10,
                            bottom: -20,
                            fontSize: 130,
                            opacity: 0.10,
                            color: "#fff",
                            pointerEvents: "none",
                        }}
                    />

                    {/* CONTENT */}
                    <Text style={{ color: "#e6f4ff" }}>
                        Total Tickets Today
                    </Text>

                    <Title level={1} style={{ color: "#fff", margin: "8px 0 0" }}>
                        <CountUp end={ticketCount} duration={1.5} />
                    </Title>
                </Card>

                <Footer />
            </div>

            {/* FLOATING BUTTON */}
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<ScanOutlined style={{ fontSize: 25 }} />}
                onClick={() => setOpenScanner(true)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    width: 60,
                    height: 60,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                }}
            />

            {/* SCANNER DRAWER */}
            <QrScannerDrawer
                open={openScanner}
                onClose={() => setOpenScanner(false)}
                onScanSuccess={(value) => {
                    setSearchValue(value);
                    setOpenResult(true);
                }}
            />

            <ShowResult
                open={openResult}
                onClose={() => setOpenResult(false)}
                searchValue={searchValue}
                onTicketIssued={() => {
                    setTicketCount((prev) => prev + 1);
                }}
            />
        </AppLayout>
    );
}