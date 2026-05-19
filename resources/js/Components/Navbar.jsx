import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button, Dropdown, Badge, Avatar, Typography, Space, List, Spin, Breadcrumb, Card, Switch, Input, theme } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    SearchOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    IdcardOutlined,
    BulbOutlined,
    BulbFilled,
    InboxOutlined,
    SunOutlined,
    MoonFilled,
    IdcardFilled,
    MoonOutlined,
    ExclamationCircleFilled
} from "@ant-design/icons";
import axios from 'axios';

const { Text } = Typography;
const { useToken } = theme;


export default function Navbar({ user, onMobileMenu, breadcrumbs = [], isDark, toggleTheme, collapsed }) {
    const [userNotifications, setUserNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!user?.profile_photo) {
            setImageError(true);
            return;
        }

        const img = new Image();

        const src = user.profile_photo.startsWith("profile-photos/")
            ? `/storage/${user.profile_photo}`
            : `https://lh3.googleusercontent.com/d/${user.profile_photo}`;

        img.src = src;

        img.onload = () => setImageError(false);
        img.onerror = () => setImageError(true);

    }, [user?.profile_photo]);

    const { token } = useToken();

    const isSecurity = user?.user_role === "security";

    useEffect(() => {
        const start = router.on('start', () => setPageLoading(true));
        const finish = router.on('finish', () => setPageLoading(false));
        const cancel = router.on('cancel', () => setPageLoading(false));

        return () => {
            start();
            finish();
            cancel();
        };
    }, []);

    const { url } = usePage();
    const isDigitalIDActive = url.startsWith('/student/digital-id');

    useEffect(() => {
        if (user?.user_role === 'student') fetchNotifications();
    }, []);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/user-notifications');
            setUserNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setUserNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await axios.post(`/notifications/${notif.id}/mark-as-read`);
                setUserNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark read", error);
            }
        }
        if (notif.data?.link) {
            router.visit(notif.data.link);
        }
    };

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");


    const handleSearch = () => {
        if (!value.trim()) return;

        router.get(`/manage-user/${user.id}/show`, {
            user_id_no: value,
        });
    };

    const notificationContent = (
        <Card
            // Replace your Card className with this:
            className="w-full sm:w-80 md:w-96 shadow-2xl border-none overflow-hidden"
            styles={{
                header: { borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px' },
                body: { padding: 0 }
            }}
            title={
                <Space>
                    <Text strong>Notifications</Text>
                    <Badge
                        count={userNotifications.filter(n => !n.is_read).length}
                        style={{ backgroundColor: '#108ee9' }}
                    />
                </Space>
            }
            extra={
                userNotifications.some(n => !n.is_read) && (
                    <Button
                        type="link"
                        size="small"
                        onClick={markAllRead}
                        className="text-xs font-medium"
                    >
                        Mark all read
                    </Button>
                )
            }
        >
            <div className="max-h-[450px] overflow-auto scrollbar-hide">
                <List
                    loading={loading}
                    dataSource={userNotifications}
                    locale={{
                        emptyText: (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-3">
                                    <InboxOutlined className="text-3xl opacity-20" />
                                </div>
                                <Text type="secondary">All caught up!</Text>
                            </div>
                        )
                    }}
                    renderItem={(item) => {
                        const isUnread = !item.is_read;
                        return (
                            <List.Item
                                onClick={() => handleNotificationClick(item)}
                                className={`
                                cursor-pointer transition-all duration-200 border-l-4 m-2
                                ${isUnread
                                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-transparent'}
                            `}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot={isUnread} offset={[-2, 32]} color="blue">
                                            <Avatar
                                                shape="circle"
                                                className={`ml-2 ${isUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                                icon={<BellOutlined />}
                                            />
                                        </Badge>
                                    }
                                    title={
                                        <div className="flex justify-between items-start gap-2">
                                            <Text strong={isUnread} className="text-sm leading-tight">
                                                {item.data?.title}
                                            </Text>
                                            <Text type="secondary" className="text-[10px] whitespace-nowrap mt-0.5 mr-2">
                                                {formatTimeAgo(item.created_at)}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <div className="mt-1">
                                            <Text type="secondary" className="text-xs line-clamp-2 leading-normal">
                                                {item.data?.message}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </div>
        </Card>
    );

    const profileMenu = {
        items: [
            { key: '1', label: 'Profile', icon: <UserOutlined />, onClick: () => router.visit('/profile') },
            { key: '2', type: 'divider' },
            { key: '3', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: () => router.post('/logout') },
        ]
    };

    return (
        <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white dark:bg-[#001529] border-b dark:border-gray-800 transition-all">
            <div className="flex items-center gap-4">
                {isSecurity ? (
                    <div className="flex items-center gap-2">
                        <img
                            onClick={() => router.visit('/security/dashboard')}
                            src={
                                isDark
                                    ? "/../assets/images/darkMode-csdl-logo.png"
                                    : "/../assets/images/defaultMode-csdl-logo.png"
                            }
                            alt="logo"
                            style={{ height: 40 }}
                        />


                    </div>
                ) : (
                    <>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={onMobileMenu}
                        />

                        <Breadcrumb className="hidden md:block">
                            {breadcrumbs.length > 0 ? (
                                breadcrumbs.map((b, i) => (
                                    <Breadcrumb.Item key={i}>{b}</Breadcrumb.Item>
                                ))
                            ) : (
                                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                            )}
                        </Breadcrumb>
                    </>
                )}
            </div>

            <Space size="middle">
                {user?.user_role === 'admin' && (
                    <div
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => !value && setOpen(false)}
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <Input
                            placeholder="Search ID..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={handleSearch}
                            onBlur={() => !value && setOpen(false)}
                            style={{
                                width: open ? 200 : 0,
                                opacity: open ? 1 : 0,
                                marginRight: open ? 8 : 0,
                                transition: "all 0.3s ease",
                                overflow: "hidden",
                            }}
                        />

                        <Button
                            type="text"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                        />
                    </div>
                )}

                {/* Theme Toggle */}
                <Switch
                    checked={isDark}
                    onChange={toggleTheme}
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                />

                {/* <Button type="text" onClick={toggleTheme} icon={isDark ? <MoonFilled className="text-yellow-400" /> : <SunOutlined />} /> */}

                {user?.user_role === 'student' && (
                    <>
                        <Dropdown dropdownRender={() => notificationContent} trigger={['click']} placement="bottomRight"
                            onOpenChange={(open) => open && fetchNotifications()}
                            overlayClassName="max-sm:!fixed max-sm:!left-2 max-sm:!right-2 max-sm:!top-16"
                        >
                            <Badge
                                count={userNotifications.filter(n => !n.is_read).length}
                                size="small"
                                offset={[-5, 5]} // Adjust these numbers until it looks perfect
                            >
                                <Button type="text" icon={<BellOutlined className="text-lg" />} />
                            </Badge>
                        </Dropdown>
                        <Button
                            type="text"
                            // Swap the icon component based on the active state
                            icon={
                                isDigitalIDActive ? (
                                    <IdcardFilled
                                        className="text-yellow-500"
                                    />
                                ) : (
                                    <IdcardOutlined
                                    />
                                )
                            }
                            onClick={() => router.visit('/student/digital-id')}
                            className={`flex items-center transition-all duration-300 ease-in-out`}
                        >
                        </Button>
                    </>
                )}

                <Dropdown menu={profileMenu} trigger={['hover']} placement="bottomRight">
                    <Space className="cursor-pointer ml-2">
                        <Spin spinning={pageLoading} indicator={null}>
                            <Badge
                                count={imageError ? <ExclamationCircleFilled style={{ color: "#ff4d4f" }} /> : 0}
                                offset={[-2, 30]}
                            >
                                <Avatar
                                    className="border-2 border-gray-300 dark:border-gray-600"
                                    src={
                                        user?.profile_photo?.startsWith("profile-photos/")
                                            ? `/storage/${user.profile_photo}`
                                            : user?.profile_photo
                                                ? `https://lh3.googleusercontent.com/d/${user.profile_photo}`
                                                : undefined
                                    }
                                    icon={<UserOutlined />}
                                    size={35}
                                />
                            </Badge>
                        </Spin>
                        <Text className="hidden sm:inline dark:text-gray-300">{user?.user_id_no}</Text>
                    </Space>
                </Dropdown>
            </Space>
        </div>
    );
}