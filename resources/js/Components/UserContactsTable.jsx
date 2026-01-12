import { InboxIcon } from "@heroicons/react/24/outline";
import { router } from "@inertiajs/react";
import React, { useState, useEffect } from "react";

export default function UserContactsTable({
    data,
    search,
    onSearch,
    actions,
    searchPlaceholder = "Search users...",
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

    const hasData = data?.data?.length > 0;

    return (
        <div className="bg-white shadow-md rounded-xl p-4">
            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={(e) => handleSearch(e.target.value)}
                    className="w-full sm:w-96 border border-gray-300 px-4 py-2 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
            </div>

            {hasData ? (
                <>
                    {/* Contacts List */}
                    <div className="divide-y">
                        {data.data.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-4 py-4 hover:bg-gray-50 transition px-2 rounded-lg"
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={
                                            user.profile_photo
                                                ? `/storage/${user.profile_photo}`
                                                : `https://ui-avatars.com/api/?name=${user.user_id_no}&background=6366f1&color=fff`
                                        }
                                        alt="Profile"
                                        className="h-12 w-12 rounded-full object-cover border"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.user_id_no}
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium
                                            ${user.user_role === "admin"
                                                    ? "bg-red-100 text-red-700"
                                                    : user.user_role === "security"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {user.user_role}
                                        </span>

                                        {user.face_enrolled ? (
                                            <span className="text-xs text-green-600 font-medium">
                                                Face Enrolled
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                No Face Data
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {actions && (
                                    <div className="flex-shrink-0">
                                        {actions(user)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data.links && data.links.length > 3 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-1">
                            {data.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && handlePaginationClick(link.url)}
                                    className={`
                                        px-3 py-1.5 text-sm rounded border transition
                                        ${link.active
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }
                                        ${!link.url ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <InboxIcon className="h-14 w-14 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-600">No users found</p>
                    <p className="text-sm text-gray-400">
                        Try adjusting your search.
                    </p>
                </div>
            )}
        </div>
    );
}
