import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Table,
    Input,
    Button,
    Space,
    Card,
    Typography,
    Grid,
    Empty,
} from "antd";
import {
    SearchOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function DataTable({
    columns,
    data,
    search,
    onSearch,
    actions,
    searchPlaceholder = "Search...",
    onExport = null,
    exportLoading = false,
    disableExport = false
}) {
    const [searchValue, setSearchValue] = useState(search || "");
    const screens = useBreakpoint();
    const hasData = data?.data?.length > 0;

    useEffect(() => {
        setSearchValue(search || "");
    }, [search]);

    const handleSearch = (value) => {
        if (value.trim() === search) return;
        onSearch(value.trim());
    };

    const handlePaginationChange = (page) => {
        const link = data.links?.find((l) =>
            l.url?.includes(`page=${page}`)
        );
        if (link?.url) {
            router.visit(link.url, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const antdColumns = [
        ...columns.map((col) => ({
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            render: (_, row) =>
                col.render ? col.render(row) : row[col.key],
        })),
        ...(actions
            ? [
                {
                    title: "Actions",
                    key: "actions",
                    align: "right",
                    render: (_, row) => actions(row),
                },
            ]
            : []),
    ];

    return (
        <Card style={{ borderRadius: 12 }}>
            <Space
                direction={screens.xs ? "vertical" : "horizontal"}
                style={{
                    width: "100%",
                    marginBottom: 16,
                    justifyContent: "space-between",
                }}
            >
                {/* SEARCH */}
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    allowClear
                    prefix={<SearchOutlined />}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchValue(value);

                        if (value === "") {
                            handleSearch("");
                        }
                    }}
                    onPressEnter={(e) => handleSearch(e.target.value)}
                    style={{ maxWidth: 300, width: "100%" }}
                />

                {/* EXPORT BUTTON */}
                {onExport && (
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={exportLoading}
                        disabled={exportLoading || disableExport || !hasData}
                        onClick={() => onExport(searchValue)}
                    >
                        Export PDF
                    </Button>
                )}
            </Space>

            <Table
                rowKey="id"
                columns={antdColumns}
                dataSource={data?.data || []}
                loading={!data} // optional safety
                pagination={{
                    current: data?.current_page,
                    pageSize: data?.per_page,
                    total: data?.total,
                    onChange: handlePaginationChange,
                    showSizeChanger: false,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                <div>
                                    <Text strong>No data found</Text>
                                    <br />
                                    <Text type="secondary">
                                        There are no records available.
                                    </Text>
                                </div>
                            }
                        />
                    ),
                }}
                scroll={{ x: "max-content" }}
            />
        </Card>
    );
}