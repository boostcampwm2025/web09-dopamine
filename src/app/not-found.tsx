import { ErrorPage } from '@/components/error/error';

export default function NotFound() {
  return (
    <ErrorPage
      fullScreen={true}
      title="페이지를 찾을 수 없어요"
      message="요청하신 페이지가 없거나 이동되었을 수 있어요."
    />
  );
}
