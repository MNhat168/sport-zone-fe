import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Define the structure for header information
interface HeaderInfo {
  title: string;
  breadcrumb: string[];
}

export function FieldOwnerDashboardHeader() {
  const location = useLocation();

  // Function to determine header title and breadcrumbs based on URL path
  const getHeaderInfo = (pathname: string): HeaderInfo => {
    switch (pathname) {
      // Default Dashboard or an overview page if exists
      case "/field-owner-dashboard": // Assuming a base path exists
      case "/field-owner/analytics": // Example mapping
        return {
          title: "Thống kê & Báo cáo",
          breadcrumb: ["Trang chủ", "Chủ sân", "Thống kê & Báo cáo"]
        };
      case "/field/create":
        return {
          title: "Tạo sân mới",
          breadcrumb: ["Trang chủ", "Chủ sân", "Tạo sân mới"]
        };
      case "/field-owner/fields":
        return {
          title: "Danh sách sân",
          breadcrumb: ["Trang chủ", "Chủ sân", "Danh sách sân"]
        };
      case "/field-owner/bookings":
        return {
          title: "Quản lý Đặt sân",
          breadcrumb: ["Trang chủ", "Chủ sân", "Đặt sân"]
        };
      case "/field-owner/revenue":
        return {
          title: "Doanh thu",
          breadcrumb: ["Trang chủ", "Chủ sân", "Doanh thu"]
        };
      case "/field-owner/locations":
        return {
          title: "Quản lý địa điểm",
          breadcrumb: ["Trang chủ", "Chủ sân", "Quản lý địa điểm"]
        };
      case "/field-owner/customers":
        return {
          title: "Khách hàng",
          breadcrumb: ["Trang chủ", "Chủ sân", "Khách hàng"]
        };
      case "/field-owner/settings":
        return {
          title: "Cài đặt",
          breadcrumb: ["Trang chủ", "Chủ sân", "Cài đặt"]
        };
      // Add other field owner paths here...

      // Default case if no path matches
      default:
        return {
          title: "Trang chủ Chủ sân", // Default title
          breadcrumb: ["Trang chủ", "Chủ sân"]
        };
    }
  };

  // Get the current header information
  const headerInfo = getHeaderInfo(location.pathname);

  return (
    // Keeping the original gradient style
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="max-w-[1320px] mx-auto px-12 py-12"> {/* Adjusted padding like coach header */}
        {/* Display dynamic title */}
        <h1 className="text-4xl font-bold text-start mb-4">{headerInfo.title}</h1>
        {/* Display dynamic breadcrumbs */}
        <div className="flex items-center gap-2 text-sm opacity-90">
          {headerInfo.breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>{item}</span>
              {/* Add separator icon if not the last item */}
              {index < headerInfo.breadcrumb.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Optional: Export as default if preferred
// export default FieldOwnerDashboardHeader;