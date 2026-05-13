import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      {/* <div className="md:ml-64 flex flex-col flex-1"> */}
      <div className="xl:ml-64 flex flex-col flex-1">
        <main className="flex-1">
          {/* <div className="container py-8 px-4 md:px-8 pt-20 md:pt-8"> */}

          <div className="container py-8 px-4 md:px-8 pt-20 xl:pt-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
