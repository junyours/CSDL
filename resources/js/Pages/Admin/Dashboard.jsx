import AppLayout from '../../Layouts/AppLayout';

export default function Dashboard({ auth }) {
    const user = auth?.user;

    return (
        <AppLayout user={user}>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-sm md:text-base">
                Welcome to your dashboard, {user?.user_id_no || 'Guest'}!
            </p>
        </AppLayout>
    );
}