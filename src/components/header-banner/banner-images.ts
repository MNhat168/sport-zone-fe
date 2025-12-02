export const BREADCRUMB_BANNERS = [
  "/banner.img/sport_banner.jpeg",
  "/banner.img/field_banner.jpeg",
  "/banner.img/sport_banner_2.jpg",
] as const

export function getBreadcrumbBanner(pathname?: string) {
  if (!pathname) {
    const index = Math.floor(Math.random() * BREADCRUMB_BANNERS.length)
    return BREADCRUMB_BANNERS[index]
  }

  // Tạo index ổn định dựa trên pathname để tránh đổi ảnh liên tục khi re-render
  let hash = 0
  for (let i = 0; i < pathname.length; i++) {
    hash = (hash * 31 + pathname.charCodeAt(i)) >>> 0
  }
  const index = hash % BREADCRUMB_BANNERS.length
  return BREADCRUMB_BANNERS[index]
}


