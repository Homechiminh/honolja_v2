import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevRootPath = useRef<string>("");

  useEffect(() => {
    // URL에서 첫 번째 경로 추출 (예: /stores/massage -> stores)
    const currentRootPath = pathname.split('/')[1];

    // 🔴 상위 카테고리 루트가 변경되었을 때만 스크롤을 맨 위로 올림
    if (currentRootPath !== prevRootPath.current) {
      window.scrollTo(0, 0);
      prevRootPath.current = currentRootPath;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
