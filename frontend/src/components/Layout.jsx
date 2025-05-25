import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useHasNewNotifications from "../hooks/useHasNewNotifications";

const Layout = ({ children, showSidebar = false }) => {
  const hasNewNotifications = useHasNewNotifications();

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar hasNewNotifications={hasNewNotifications} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
