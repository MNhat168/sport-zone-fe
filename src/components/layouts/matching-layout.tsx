import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavbarDarkComponent } from '../header/navbar-dark-component';
import { FooterComponent } from '../footer/footer-component';
import { MatchingSidebar } from '../matching/MatchingSidebar';
import { AuthWrapper } from '@/routes/auth-wrapper';

export const MatchingLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <NavbarDarkComponent />

            {/* Main Content Area */}
            <main className="flex-1 pt-20 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)] p-4 gap-4">
                    {/* Dynamic Sidebar Container */}
                    <aside className="hidden lg:block h-full transition-all duration-500 ease-in-out">
                        <MatchingSidebar />
                    </aside>

                    {/* Main Content Area - Center Focused */}
                    <section className="flex-1 overflow-y-auto relative scrollbar-hide bg-white/40 rounded-[48px] border border-slate-200/50 backdrop-blur-sm shadow-xl shadow-slate-200/20">
                        <div className="p-8 pb-20 max-w-6xl mx-auto">
                            <AuthWrapper>
                                <Outlet />
                            </AuthWrapper>
                        </div>
                    </section>
                </div>
            </main>

            <FooterComponent />
        </div>
    );
};

export default MatchingLayout;
