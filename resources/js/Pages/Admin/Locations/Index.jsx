import { useState, useEffect } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import Map from "../../../Components/Map";
import Create from "./Create";
import axios from "axios";

import {
    Button,
    Card,
    Col,
    Grid,
    Row,
    Typography,
    List,
    Dropdown,
    Menu,
    Modal,
    message,
    Empty,
} from "antd";

import {
    PlusOutlined,
    MoreOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { theme } from "antd";
import { useTheme } from "../../../ThemeContext";

const { useToken } = theme;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

export default function Index({ auth, locations: serverLocations }) {
    const user = auth?.user;

    const [locations, setLocations] = useState(serverLocations || []);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const { token } = useToken();

    // detect dark mode
    const { isDark, toggleTheme } = useTheme();
    const mapTheme = isDark ? "dark" : "light";

    // Initialize selection
    useEffect(() => {
        if (locations.length > 0) {
            const first = locations[0];
            setSelectedLocationId(first.id);
            setSelectedPolygon(first.polygon_points);
        } else {
            setSelectedLocationId(null);
            setSelectedPolygon(null);
        }
    }, [locations]);

    const handleCreated = (newLocation) => {
        setLocations((prev) => [newLocation, ...prev]);
        setSelectedLocationId(newLocation.id);
        setSelectedPolygon(newLocation.polygon_points);
        setShowCreate(false);
    };

    const moveToBin = (id) => {
        confirm({
            title: "Move this location to bin?",
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone.",
            okText: "Yes, move",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await axios.patch(`/setup/location/${id}/move-to-bin`);

                    message.success("Location moved to bin");

                    const updated = locations.filter((loc) => loc.id !== id);
                    setLocations(updated);

                    // Reset selection if needed
                    if (selectedLocationId === id) {
                        if (updated.length > 0) {
                            setSelectedLocationId(updated[0].id);
                            setSelectedPolygon(updated[0].polygon_points);
                        } else {
                            setSelectedLocationId(null);
                            setSelectedPolygon(null);
                        }
                    }

                } catch (error) {
                    message.error("Failed to move location");
                    console.error(error);
                }
            },
        });
    };

    const getMenuItems = (loc) => [
        {
            key: "delete",
            label: "Move to bin",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => moveToBin(loc.id),
        },
    ];

    return (
        <AppLayout user={user} breadcrumbs={["Setup", "Locations"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {/* HEADER */}
                <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                Setup Locations
                            </Title>
                            <Text type="secondary">
                                Configure and manage all locations
                            </Text>
                        </Col>

                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size={isMobile ? "middle" : "large"}
                                onClick={() => setShowCreate(true)}
                            >
                                Create New
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* MAIN CONTENT */}
                <Row gutter={16}>
                    {/* LOCATION LIST */}
                    <Col xs={24} md={8}>
                        <Card
                            title="Locations"
                            style={{ height: "60vh" }}
                            bodyStyle={{
                                padding: 12,
                                height: "100%",
                                overflowY: "auto",
                            }}
                        >
                            {locations.length === 0 ? (
                                <Empty description="No locations found" />
                            ) : (
                                <List
                                    dataSource={locations}
                                    split={false}
                                    renderItem={(loc) => {
                                        const isActive = selectedLocationId === loc.id;

                                        return (
                                            <List.Item
                                                onClick={() => {
                                                    setSelectedLocationId(loc.id);
                                                    setSelectedPolygon(loc.polygon_points);
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    borderRadius: token.borderRadiusLG,
                                                    marginBottom: 8,
                                                    padding: 12,
                                                    transition: "all 0.2s ease",


                                                    border: isActive
                                                        ? `1px solid ${token.colorPrimaryBorder}`
                                                        : `1px solid transparent`,

                                                    // optional accent line (very common in Ant Design patterns)
                                                    borderLeft: isActive
                                                        ? `4px solid ${token.colorPrimary}`
                                                        : `4px solid transparent`,
                                                }}
                                                className="location-item"
                                                actions={[
                                                    <Dropdown
                                                        menu={{ items: getMenuItems(loc) }}
                                                        trigger={["click"]}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<MoreOutlined />}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </Dropdown>,
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <Text strong={isActive}>
                                                            {loc.location_name}
                                                        </Text>
                                                    }
                                                    description={
                                                        <Text type="secondary">
                                                            {loc.address}
                                                        </Text>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            )}
                        </Card>
                    </Col>

                    {/* MAP */}
                    <Col xs={24} md={16}>
                        <Card
                            title="Map View"
                            style={{ height: "60vh" }}
                            bodyStyle={{ padding: 0, height: "100%" }}
                        >
                            <Map
                                center={[-73.935242, 40.73061]}
                                zoom={12}
                                polygon={selectedPolygon}
                                theme={mapTheme}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* CREATE MODAL */}
                <Modal
                    title="Create Location"
                    open={showCreate}
                    onCancel={() => setShowCreate(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Create
                        onClose={() => setShowCreate(false)}
                        onCreated={handleCreated}
                    />
                </Modal>

            </div>
        </AppLayout>
    );
}