import AppLayout from '../../../Layouts/AppLayout';
import DigitalID from '../../../Components/DigitalID';
import { AlertTriangle, ArrowRight, Clock, Info, ShieldCheck } from 'lucide-react';
import { router } from '@inertiajs/react';
import ProfilePhotoWarning from '../../../Components/ProfilePhotoWarning';
import { useEffect, useState } from 'react';

export default function Index({ auth, studentData, userCreatedAt, qr_token, }) {
    const user = auth?.user;
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

    return (
        <AppLayout user={user} breadcrumbs={["Digital ID"]}>
            <div className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden">
                {user?.profile_photo && !imageError ? (
                    <div className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden">

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center w-full px-4"

                        >

                            <DigitalID
                                userIdNo={qr_token || 'N/A'}
                                userProfilePhoto={user?.profile_photo}
                                studentData={studentData}
                                userCreatedAt={userCreatedAt}
                            />
                        </div>
                    </div>
                ) : (
                    <ProfilePhotoWarning
                        onAction={() => router.visit("/profile")}
                    />
                )}
            </div>
        </AppLayout>
    );
}