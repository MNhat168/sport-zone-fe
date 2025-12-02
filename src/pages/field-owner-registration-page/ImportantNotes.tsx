
export function ImportantNotes() {
  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        Lưu ý quan trọng
      </h4>
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>Đơn đăng ký sẽ được xét duyệt trong vòng 1-3 ngày làm việc</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>Vui lòng cung cấp thông tin chính xác để tránh trì hoãn trong quá trình xét duyệt</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>Bạn có thể kiểm tra trạng thái đơn đăng ký tại mục "Trạng thái đăng ký"</span>
        </li>
      </ul>
    </div>
  )
}

