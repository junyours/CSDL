import { InboxIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function DataTable({
    columns,
    data,
    search,
    onSearch,
    actions,
    searchPlaceholder = "Search...",
}) {
    const [searchValue, setSearchValue] = useState(search || "");

    useEffect(() => {
        setSearchValue(search || "");
    }, [search]);

    const handleSearch = (value) => {
        if (value.trim() === search) return;
        onSearch(value.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch(e.target.value);
    };

    const handlePaginationClick = (url) => {
        if (!url) return;
        router.visit(url, { preserveState: true, preserveScroll: true });
    };

    const hasData = data?.data && data.data.length > 0;

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={(e) => {
                        if (e.target.value.trim() !== search) handleSearch(e.target.value.trim());
                    }}
                    className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-80 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
            </div>

            {/* Table / Cards */}
            {hasData ? (
                <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto rounded-md border border-gray-200 hidden lg:block">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    {columns.map((col) => (
                                        <th key={col.key} className="py-3 px-6">{col.label}</th>
                                    ))}
                                    {actions && <th className="py-3 px-6 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.data.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">
                                        {columns.map((col) => (
                                            <td key={col.key} className="py-4 px-6 text-sm">
                                                {col.render ? col.render(row) : row[col.key]}
                                            </td>
                                        ))}
                                        {actions && <td className="py-4 px-6 text-right">{actions(row)}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {data.data.map((row) => (
                            <div key={row.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="space-y-3">
                                    {columns.map((col) => (
                                        <div key={col.key}>
                                            <span className="text-xs font-medium text-gray-500">{col.label}</span>
                                            <div className="mt-1 text-sm">{col.render ? col.render(row) : row[col.key]}</div>
                                        </div>
                                    ))}
                                </div>
                                {actions && (
                                    <div className="mt-4 pt-4 border-t flex justify-end">{actions(row)}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data.links && data.links.length > 3 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-1">
                            {data.links.map((link, i) => {
                                const isDisabled = !link.url;
                                const isActive = link.active;

                                return (
                                    <button
                                        key={i}
                                        disabled={isDisabled}
                                        onClick={() => !isDisabled && handlePaginationClick(link.url)}
                                        className={`
                                            px-3 py-1.5 min-w-[36px] text-sm rounded border transition
                                            ${isActive
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }
                                            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <InboxIcon className="h-14 w-14 text-gray-300 mb-4" />
                    <span className="text-lg font-medium text-gray-600">No data found</span>
                    <span className="text-sm text-gray-400 mt-1">
                        There are no records available at the moment.
                    </span>
                </div>
            )}
        </div>
    );
}
