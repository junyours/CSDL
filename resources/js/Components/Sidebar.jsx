import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Layout, Menu, Drawer, Typography, theme, Grid } from "antd";
import {
    DashboardOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    UserOutlined,
    FileTextOutlined,
    BankOutlined,
    HomeOutlined,
    IdcardOutlined,
    UnorderedListOutlined,
    ClusterOutlined
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

export default function Sidebar({
    user,
    mobileOpen,
    setMobileOpen,
    collapsed,
    setCollapsed,
    isDark
}) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];
    const isActive = (key) => currentPath.startsWith(key);

    const { token } = useToken();
    const screens = useBreakpoint();

    const isMobile = !screens.lg;
    const role = user?.user_role || "guest";

    if (role === "security") return null;

    const getMenuItems = () => {
        const items = [];

        if (role === "admin") {
            items.push(
                {
                    key: "grp1",
                    label: (
                        <span style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#6b7280",
                            letterSpacing: "0.1em"
                        }}>
                            MENU
                        </span>
                    ),
                    type: "group",
                    children: [
                        {
                            key: "/admin/dashboard",
                            icon: <DashboardOutlined />,
                            label: <Link href="/admin/dashboard">Dashboard</Link>
                        }
                    ]
                },
                {
                    key: "grp2",
                    label: (
                        <span style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#6b7280",
                            letterSpacing: "0.1em"
                        }}>
                            SETUP
                        </span>
                    ),
                    type: "group",
                    children: [
                        {
                            key: "/setup-violation",
                            icon: <SafetyCertificateOutlined />,
                            label: <Link href="/setup-violation">Violation</Link>
                        },
                        {
                            key: "/setup-sanction",
                            icon: <StopOutlined />,
                            label: <Link href="/setup-sanction">Sanction</Link>
                        },
                        {
                            key: "/setup-location",
                            icon: <EnvironmentOutlined />,
                            label: <Link href="/setup-location">Location</Link>
                        }
                    ]
                },
                {
                    key: "grp3",
                    label: (
                        <span style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#6b7280",
                            letterSpacing: "0.1em"
                        }}>
                            MANAGE
                        </span>
                    ),
                    type: "group",
                    children: [
                        {
                            key: "/manage-event",
                            icon: <CalendarOutlined />,
                            label: <Link href="/manage-event">Events</Link>
                        },
                        {
                            key: "/manage-user",
                            icon: <UserOutlined />,
                            label: <Link href="/manage-user">Users</Link>
                        },
                        {
                            key: "/manage-violation-records",
                            icon: <FileTextOutlined />,
                            label: <Link href="/manage-violation-records">Records</Link>
                        },
                        {
                            key: "/manage-clubs",
                            icon: <BankOutlined />,
                            label: <Link href="/manage-clubs">Clubs</Link>
                        },
                        // {
                        //     key: "/manage-office",
                        //     icon: <ClusterOutlined />,
                        //     label: <Link href="/manage-offices">Offices</Link>
                        // },
                        // {
                        //     key: "/manage-eclearance",
                        //     icon: <UnorderedListOutlined />,
                        //     label: <Link href="/manage-eclearance">e-Clearance</Link>
                        // }
                    ]
                }
            );
        } else if (role === "student") {
            items.push({
                key: "grp1",
                type: "group",
                children: [
                    {
                        key: "/student/dashboard",
                        icon: <HomeOutlined />,
                        label: <Link href="/student/dashboard">Home</Link>
                    },
                    {
                        key: "/student/digital-id",
                        icon: <IdcardOutlined />,
                        label: <Link href="/student/digital-id">Digital ID</Link>
                    },
                    {
                        key: "/student/my-clubs",
                        icon: <ClusterOutlined />,
                        label: <Link href="/student/my-clubs">My Clubs</Link>
                    },
                    {
                        key: "/student/violations",
                        icon: <FileTextOutlined />,
                        label: <Link href="/student/violations">Violations</Link>
                    },
                     {
                        key: "/events",
                        icon: <CalendarOutlined />,
                        label: <Link href="/events">Events</Link>
                    },

                ]
            });
        } else if (role === "guidance_counselor") {
            items.push({
                key: "grp1",
                type: "group",
                children: [
                    {
                        key: "/guidance/dashboard",
                        icon: <HomeOutlined />,
                        label: <Link href="/guidance/dashboard">Home</Link>
                    },
                    {
                        key: "/events",
                        icon: <CalendarOutlined />,
                        label: <Link href="/events">Events</Link>
                    },
                ]
            });
        }

        return items;
    };

    const LogoSection = (
        <div
            style={{
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? 0 : "0 16px",
                borderBottom: `1px solid ${token.colorBorder}`
            }}
        >
            <img
                src={
                    isDark
                        ? "/../assets/images/darkMode-csdl-logo.png"
                        : "/../assets/images/defaultMode-csdl-logo.png"
                }
                alt="logo"
                style={{
                    height: 35,
                    marginRight: collapsed ? 0 : 12
                }}
            />
            {!collapsed && (
                <span
                    className={`font-bold leading-tight sm:text-[7px] text-[9px]`}
                    style={{ color: token.colorText }}
                >
                    CENTER FOR STUDENT DEVELOPMENT & LEADERSHIP
                    <br />
                    <span className="text-[9px] font-light opacity-70">
                        Opol Community College
                    </span>
                </span>
            )}
        </div>
    );

    const SidebarContent = (
        <>
            {LogoSection}
            <Menu
                theme={isDark ? "dark" : "light"}
                mode="inline"
                selectedKeys={
                    getMenuItems()
                        .flatMap(group => group.children || [])
                        .filter(item => isActive(item.key))
                        .map(item => item.key)
                }
                items={getMenuItems()}
            />
        </>
    );

    return (
        <>
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(val) => setCollapsed(val)}
                    collapsedWidth={80}
                    trigger={null}
                    theme={isDark ? "dark" : "light"}
                    width={200}
                    style={{
                        position: "fixed",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 1000,
                        borderRight: `1px solid ${token.colorBorder}`
                    }}
                >
                    {SidebarContent}
                </Sider>
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    width={240}
                    closable={false}
                    styles={{
                        body: {
                            padding: 0,
                            background: isDark ? "#001529" : "#ffffff",
                        },
                        content: {
                            background: isDark ? "#001529" : "#ffffff",
                        },
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            color: isDark ? "#fff" : "inherit",
                        }}
                    >
                        {SidebarContent}
                    </div>
                </Drawer>
            )}
        </>
    );
}