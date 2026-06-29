import useAuth from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import LeadDashboard from './LeadDashboard';
import MemberDashboard from './MemberDashboard';

const SmartDashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'lead') return <LeadDashboard />;

    return <MemberDashboard />;
};

export default SmartDashboard;