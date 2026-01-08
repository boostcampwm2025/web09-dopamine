import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { STATUS_LABEL, STEP_FLOW } from '@/constants/issue';
import * as S from './progress-bar.styles';

const PROGRESS_BAR_DURATION = 0.3;

const ProgressBar = () => {
  const status = useIssueStore((state) => state.status);
  const currentIndex = STEP_FLOW.indexOf(status);

  return (
    <S.Container>
      {STEP_FLOW.map((step, index) => {
        const isActive = index <= currentIndex;
        const isLineActive = index < currentIndex;
        const showLine = index < STEP_FLOW.length - 1;

        return (
          <S.StepWrapper key={step}>
            {showLine && (
              <S.LineWrapper>
                <S.ActiveLineBar
                  isActive={isLineActive}
                  duration={PROGRESS_BAR_DURATION}
                />
              </S.LineWrapper>
            )}
            <S.Circle
              isActive={isActive}
              delay={PROGRESS_BAR_DURATION}
            >
              {index + 1}
              <S.Label
                isActive={isActive}
                delay={PROGRESS_BAR_DURATION}
              >
                {STATUS_LABEL[step]}
              </S.Label>
            </S.Circle>
          </S.StepWrapper>
        );
      })}
    </S.Container>
  );
};

export default ProgressBar;
