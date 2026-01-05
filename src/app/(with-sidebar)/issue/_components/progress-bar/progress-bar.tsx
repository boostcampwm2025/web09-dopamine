import { STATUS_LABEL, STEP_FLOW } from '@/constants/issue';
import { useIssueStore } from '@/store/issue';
import * as S from './progress-bar.style';

const PROGRESS_BAR_DURATION = 0.3;

const ProgressBar = () => {
  const status = useIssueStore((state) => state.status);
  const steps = STEP_FLOW.slice(0, -1);
  const currentIndex = STEP_FLOW.indexOf(status);

  return (
    <S.Container>
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isLineActive = index < currentIndex;
        const showLine = index < steps.length - 1;

        return (
          <S.StepWrapper key={step}>
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
            {showLine && (
              <S.LineWrapper>
                <S.ActiveLineBar
                  isActive={isLineActive}
                  duration={PROGRESS_BAR_DURATION}
                />
              </S.LineWrapper>
            )}
          </S.StepWrapper>
        );
      })}
    </S.Container>
  );
};

export default ProgressBar;
