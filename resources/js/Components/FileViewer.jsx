import { Modal } from "antd";

export default function FileViewer({ open, onClose, file }) {
    if (!file) return null;

    const fileUrl = file.url || file;

    const getFileType = (url) => {
        const ext = url.split(".").pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
        if (ext === "pdf") return "pdf";
        if (["mp4", "webm", "ogg"].includes(ext)) return "video";
        if (["mp3", "wav"].includes(ext)) return "audio";
        return "other";
    };

    const type = getFileType(fileUrl);

    const renderContent = () => {
        switch (type) {
            case "image":
                return <img src={fileUrl} style={{ width: "100%" }} />;

            case "pdf":
                return (
                    <iframe
                        src={fileUrl}
                        width="100%"
                        height="600px"
                        style={{ border: "none" }}
                    />
                );

            case "video":
                return (
                    <video controls style={{ width: "100%" }}>
                        <source src={fileUrl} />
                    </video>
                );

            case "audio":
                return <audio controls src={fileUrl} style={{ width: "100%" }} />;

            default:
                return (
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                        Open File
                    </a>
                );
        }
    };

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={800}>
            {renderContent()}
        </Modal>
    );
}