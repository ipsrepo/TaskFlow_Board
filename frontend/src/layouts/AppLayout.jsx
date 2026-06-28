import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden bg-canvas">
            <Navbar
                onMenuToggle={() =>
                    setIsSidebarOpen((previous) => !previous)
                }
            />

            <div className="flex h-[calc(100vh-4rem)]">
                <Sidebar
                    open={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;