import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Sidebar } from '../components/layout/sidebar';
import { PageContainer } from '../components/ui/page-container';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <PageContainer>
        <div className="flex gap-6">
          <Sidebar />
          <div className="min-w-0 flex-1 space-y-6">
            <Header />
            <Outlet />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
