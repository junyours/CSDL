import { useEffect, useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    Row,
    Col,
    Card,
    Typography,
    Button,
    Avatar,
    Tag,
    Space,
    Divider,
    Empty,
    Grid,
    Modal,
    Drawer,
    List,
} from "antd";
import {
    PlusOutlined,
    TeamOutlined,
    FileTextOutlined,
    FileOutlined,
    UserOutlined,
    RightOutlined,
} from "@ant-design/icons";
import Create from "./Create";
import { router } from "@inertiajs/react";
import FileViewer from "../../../Components/FileViewer";
import { theme } from "antd";
import ClubCard from "./ClubCard";
import ManageClubDrawer from "./ManageClubDrawer";
import ProfilePhotoWarning from "../../../Components/ProfilePhotoWarning";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Index({ auth, clubs }) {
    const user = auth?.user;
    const { token } = theme.useToken();

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

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [selectedFile, setSelectedFile] = useState(null);
    const [open, setOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleSuccess = () => {
        setShowCreateModal(false);
        router.reload({ only: [] });
    };

    const [manageOpen, setManageOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);

    const openManage = (club) => {
        setSelectedClub(club.id); // ONLY ID
        setManageOpen(true);
    };

    const closeManage = () => {
        setManageOpen(false);
        setSelectedClub(null);
    };


    const memberClubs = clubs.filter(club => club.is_member);
    const availableClubs = clubs.filter(club => !club.is_member);


    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Clubs"]}>
            <div style={{ padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto" }}>

                {user?.profile_photo && !imageError ? (
                    <>
                        {/* HEADER */}
                        <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                            <Row justify="space-between" align="middle" gutter={[8, 8]}>
                                <Col>
                                    <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                        Clubs & Organizations
                                    </Title>
                                    <Text type="secondary">
                                        Manage and configure your organizations
                                    </Text>
                                </Col>

                                <Col>
                                    <Button
                                        onClick={() => setShowCreateModal(true)}
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        size={isMobile ? "middle" : "large"}
                                    >
                                        Create Club
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        {/* CLUB SECTIONS */}
                        {(() => {

                            const memberClubs = clubs.filter(club => club.is_member);
                            const availableClubs = clubs.filter(club => !club.is_member);

                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                                    {/* MY CLUBS */}
                                    <div>
                                        <Divider orientation="left">
                                            <Space>
                                                <TeamOutlined />
                                                <span>My Clubs ({memberClubs.length})</span>
                                            </Space>
                                        </Divider>

                                        {memberClubs.length > 0 ? (
                                            isMobile ? (
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 16,
                                                }}>
                                                    {memberClubs.map((club) => (
                                                        <ClubCard
                                                            key={club.id}
                                                            club={club}
                                                            onManage={openManage}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <Row gutter={[16, 16]}>
                                                    {memberClubs.map((club) => (
                                                        <Col
                                                            xs={24}
                                                            sm={12}
                                                            md={8}
                                                            lg={6}
                                                            key={club.id}
                                                        >
                                                            <ClubCard
                                                                club={club}
                                                                onManage={openManage}
                                                            />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            )
                                        ) : (
                                            <Card>
                                                <Empty description="You are not a member of any club yet" />
                                            </Card>
                                        )}
                                    </div>

                                    {/* AVAILABLE CLUBS */}
                                    <div>
                                        <Divider orientation="left">
                                            <Space>
                                                <UserOutlined />
                                                <span>Other Clubs ({availableClubs.length})</span>
                                            </Space>
                                        </Divider>

                                        {availableClubs.length > 0 ? (
                                            isMobile ? (
                                                <div style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 16,
                                                }}>
                                                    {availableClubs.map((club) => (
                                                        <ClubCard
                                                            key={club.id}
                                                            club={club}
                                                            onManage={openManage}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <Row gutter={[16, 16]}>
                                                    {availableClubs.map((club) => (
                                                        <Col
                                                            xs={24}
                                                            sm={12}
                                                            md={8}
                                                            lg={6}
                                                            key={club.id}
                                                        >
                                                            <ClubCard
                                                                club={club}
                                                                onManage={openManage}
                                                            />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            )
                                        ) : (
                                            <Card>
                                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No available clubs" />
                                            </Card>
                                        )}
                                    </div>

                                </div>
                            );
                        })()}
                    </>
                ) : (
                    <ProfilePhotoWarning
                        onAction={() => router.visit("/profile")}
                    />
                )}
            </div>

            <ManageClubDrawer
                open={manageOpen}
                onClose={closeManage}
                clubId={selectedClub}
                user={user}
            />

            {/* CREATE MODAL */}
            <Modal
                title="Create Club / Organization"
                open={showCreateModal}
                onCancel={() => setShowCreateModal(false)}
                footer={null}
                destroyOnClose
            >
                <Create
                    auth={auth}
                    onSuccess={handleSuccess}
                />
            </Modal>

            <FileViewer
                open={open}
                onClose={() => setOpen(false)}
                file={selectedFile}
            />
        </AppLayout>
    );
}