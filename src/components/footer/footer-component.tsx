import { Facebook, Twitter, Instagram } from "lucide-react";

export const FooterComponent = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div
              className="text-2xl font-bold mb-4"
              style={{ color: "#F2A922" }}
            >
              SportZone
            </div>
            <p className="text-gray-400 mb-4">
              Điểm đến hàng đầu của bạn cho việc đặt sân thể thao và dịch vụ huấn luyện.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Đặt Sân
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Tìm Huấn Luyện Viên
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sân Gần Đây
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Pháp Lý</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Điều Khoản Dịch Vụ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Liên Hệ Chúng Tôi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 SportZone. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};
