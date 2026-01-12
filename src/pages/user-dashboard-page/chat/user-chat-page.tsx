
import React from 'react';
import { PageWrapper } from "@/components/layouts/page-wrapper";
import { UserDashboardHeader } from "@/components/header/user-dashboard-header";
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";

const UserChatPage = () => {
  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper>
        <UserDashboardHeader />
        <UserDashboardTabs />
        <div className="w-full max-w-[1320px] mx-auto px-3 py-8">
          <h1 className="text-2xl font-bold">Chat</h1>
          <p>Chat feature coming soon.</p>
        </div>
      </PageWrapper>
    </>
  );
};

export default UserChatPage;
