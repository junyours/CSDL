import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
    // Lock background scroll when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, [isOpen]);

    // Close modal on ESC key
    useEffect(() => {
        const esc = (e) => e.key === "Escape" && isOpen && onClose();
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
            {/* Modal Container */}
            <div
                className="
                    relative
                    w-full
                    h-[100dvh]
                    sm:h-auto
                    sm:max-h-[90vh]
                    sm:max-w-lg
                    bg-white
                    rounded-t-2xl sm:rounded-xl
                    shadow-2xl
                    flex flex-col
                "
            >
                {/* Header */}
                <div className="shrink-0 bg-white px-4 py-3 border-b rounded-t-2xl sm:rounded-t-xl flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
            </div>
        </div>
    );
}
