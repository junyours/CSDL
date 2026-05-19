import React from "react";
import { usePage } from "@inertiajs/react";
import {
    Layout,
    Typography,
    Row,
    Col,
    ConfigProvider,
    Grid,
    theme,
} from "antd";

import { useTheme } from "../ThemeContext";
import Login from "./Auth/Login";

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function WelcomePage() {
    const { isDark } = useTheme();
    const { apkInfo } = usePage().props;

    const screens = useBreakpoint();

    /**
     * MOBILE ONLY = BELOW 768px
     * TABLET = 768px - 1023px
     * DESKTOP = 1024px+
     */
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const isDesktop = screens.lg;

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#1877f2",
                    borderRadius: 20,
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                },
            }}
        >
            <AppContent
                isDark={isDark}
                isMobile={isMobile}
                isTablet={isTablet}
                isDesktop={isDesktop}
            />
        </ConfigProvider>
    );
}

function AppContent({
    isDark,
    isMobile,
    isTablet,
    isDesktop,
}) {
    const logoSrc = isDark
        ? "./assets/images/darkMode-csdl-logo.png"
        : "./assets/images/defaultMode-csdl-logo.png";

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: isDark ? "#111827" : "#f5f5f5",
            }}
        >
            {/* MOBILE HEADER */}
            {isMobile && (
                <Header
                    style={{
                        background: "transparent",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "18px 16px",
                        height: "auto",
                    }}
                >
                    <img
                        src={logoSrc}
                        alt="Logo"
                        style={{
                            height: 40,
                            objectFit: "contain",
                        }}
                    />
                </Header>
            )}

            <Content
                style={{
                    flex: 1,
                    width: "100%",
                }}
            >
                {/* MOBILE */}
                {isMobile ? (
                    <div
                        style={{
                            minHeight: "calc(100vh - 80px)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "24px 16px",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: 420,
                            }}
                        >
                            <Login />
                        </div>
                    </div>
                ) : (
                    /* TABLET + DESKTOP */
                    <Row
                        style={{
                            minHeight: "100vh",
                            margin: 0,
                            flexWrap: "nowrap",
                        }}
                    >
                        {/* LEFT SIDE */}
                        <Col
                            md={14}
                            lg={14}
                            style={{
                                background: isDark
                                    ? "#0f172a"
                                    : "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                overflow: "hidden",

                                /**
                                 * RESPONSIVE PADDING
                                 */
                                padding: isDesktop
                                    ? "80px 72px"
                                    : "48px 28px",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    maxWidth: isDesktop
                                        ? 980
                                        : 760,
                                }}
                            >
                                {/* LOGO */}
                                <img
                                    src={logoSrc}
                                    alt="Logo"
                                    style={{
                                        width: isDesktop ? 70 : 54,
                                        marginBottom: isDesktop
                                            ? 2
                                            : 0,
                                    }}
                                />

                                {/* CONTENT */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",

                                        /**
                                         * SMALLER GAP ON TABLET
                                         */
                                        gap: isDesktop ? 6 : 6,
                                    }}
                                >
                                    {/* TEXT */}
                                    <div
                                        style={{
                                            flex: isDesktop
                                                ? 1
                                                : 1,
                                        }}
                                    >
                                        <Title
                                            style={{
                                                margin: 0,
                                                fontWeight: 400,
                                                lineHeight: 0.95,

                                                /**
                                                 * RESPONSIVE TEXT
                                                 */
                                                fontSize: isDesktop
                                                    ? 55
                                                    : 40,

                                                letterSpacing: isDesktop
                                                    ? "-3px"
                                                    : "-1.5px",

                                                color: isDark
                                                    ? "#ffffff"
                                                    : "#111111",
                                            }}
                                        >
                                            Records made
                                            <br />
                                            <span
                                                style={{
                                                    color: "#1877f2",
                                                }}
                                            >
                                                secure & centralized
                                            </span>
                                        </Title>
                                    </div>

                                    {/* HERO IMAGE */}
                                    <div
                                        style={{
                                            flex: isDesktop
                                                ? 1.5
                                                : 1.25,

                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img
                                            src="./assets/images/f1fb76d6-2a18-47e9-83ee-dec47527cafb.png"
                                            alt="Hero"
                                            style={{
                                                width: "100%",

                                                /**
                                                 * BIGGER ON DESKTOP
                                                 * CONTROLLED ON TABLET
                                                 */
                                                maxWidth: isDesktop
                                                    ? 760
                                                    : 500,

                                                objectFit: "contain",
                                                display: "block",

                                                /**
                                                 * RESPONSIVE SCALE
                                                 */
                                                transform: isDesktop
                                                    ? "scale(1.28)"
                                                    : "scale(1.05)",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* RIGHT SIDE */}
                        <Col
                            md={10}
                            lg={10}
                            style={{
                                background: isDark
                                    ? "#111827"
                                    : "#ffffff",

                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",

                                padding: isDesktop
                                    ? "40px"
                                    : "24px",

                                borderLeft: isDark
                                    ? "1px solid rgba(255,255,255,0.08)"
                                    : "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",

                                    /**
                                     * SMALLER LOGIN WIDTH ON TABLET
                                     */
                                    maxWidth: isDesktop
                                        ? 440
                                        : 360,
                                }}
                            >
                                <Login />
                            </div>
                        </Col>
                    </Row>
                )}
            </Content>
        </Layout>
    );
}