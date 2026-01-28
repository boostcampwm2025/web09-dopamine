import { useEffect, useState } from 'react';
import { STATUS_LABEL, STEP_FLOW } from '@/constants/issue';
import { useIssueData, useIssueId } from '../../hooks';
import * as S from './progress-bar.styles';

const PROGRESS_BAR_DURATION = 0.3;

const ProgressBar = () => {
  const issueId = useIssueId();
  const { status } = useIssueData(issueId);
  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const targetIndex = STEP_FLOW.indexOf(status);
    if (targetIndex <= animatedIndex) return;

    let i = animatedIndex;

    const interval = setInterval(() => {
      i += 1;
      setAnimatedIndex(i);

      if (i >= targetIndex) {
        clearInterval(interval);
      }
    }, PROGRESS_BAR_DURATION * 1000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <S.Container>
      {STEP_FLOW.map((step, index) => {
        const isActive = index <= animatedIndex;
        const isLineActive = index < animatedIndex;
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
