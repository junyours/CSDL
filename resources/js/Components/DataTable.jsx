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
    total,
    // Added exportRoute prop
    exportRoute = null,
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
        <div className="bg-white shadow-sm border rounded-lg p-4">
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

                {/* Conditional Export Button */}
                {exportRoute && (
                    <button
                        onClick={() =>
                            window.location.href = `${exportRoute}?search=${searchValue}`
                        }
                        className="px-4 py-2 bg-green-600 w-full md:w-auto text-white rounded-md hover:bg-green-700 transition"
                    >
                        Export as PDF
                    </button>
                )}
            </div>

            {/* Table / Cards */}
            {hasData ? (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-max w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="px-6 py-3 whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        {actions && (
                                            <th className="px-6 py-3 text-right whitespace-nowrap">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {data.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition">
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                                                >
                                                    {col.render ? col.render(row) : row[col.key]}
                                                </td>
                                            ))}

                                            {actions && (
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {actions(row)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">

                            {/* Showing Info */}
                            <div className="text-sm text-gray-600">
                                Showing{" "}
                                <span className="font-medium">{data.from}</span> to{" "}
                                <span className="font-medium">{data.to}</span> of{" "}
                                <span className="font-medium">{data.total}</span> results
                            </div>

                            {/* Pagination Buttons */}
                            <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
                                {data.links.map((link, i) => {
                                    const isDisabled = !link.url;
                                    const isActive = link.active;

                                    // Logic to hide page numbers on mobile, but keep "Previous" and "Next"
                                    // link.label usually contains "&laquo; Previous" or "Next &raquo;"
                                    const isPageNumber = !isNaN(link.label);

                                    return (
                                        <button
                                            key={i}
                                            disabled={isDisabled}
                                            onClick={() => !isDisabled && handlePaginationClick(link.url)}
                                            className={`
                            px-3 py-2 text-sm rounded-md border transition
                            ${isActive
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                                }
                            ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
                            /* Hide page numbers on extra small screens, show them from 'sm' up */
                            ${isPageNumber ? "hidden sm:inline-block" : "flex-1 sm:flex-none text-center"}
                        `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
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