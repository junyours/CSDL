import React, { useState } from "react";
import { Layout, ConfigProvider, theme, Grid } from "antd";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "../ThemeContext";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout({ children, user, breadcrumbs = [] }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const { isDark, toggleTheme } = useTheme();
    const screens = useBreakpoint();

    const isMobile = !screens.lg;

    const isSecurity = user?.user_role === "security";

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: { colorPrimary: "#1677ff" }
            }}
        >
            <Layout style={{ minHeight: "100vh" }}>
                <Sidebar
                    user={user}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    isDark={isDark}
                />

                <Layout
                    style={{
                        marginLeft: !isMobile && !isSecurity
                            ? (collapsed ? 80 : 200)
                            : 0
                    }}
                >
                    <Navbar
                        user={user}
                        breadcrumbs={breadcrumbs}
                        collapsed={collapsed}
                        onMobileMenu={() => {
                            if (isMobile) setMobileOpen(true);
                            else setCollapsed(!collapsed);
                        }}
                        isDark={isDark}
                        toggleTheme={toggleTheme}
                    />

                    <Content>
                        {children}
                    </Content>
                </Layout>
            </Layout>

            <Toaster position="top-center" />
        </ConfigProvider>
    );
}