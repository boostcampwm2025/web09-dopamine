import styled from '@emotion/styled';
import { STATUS_LABEL, STEP_FLOW } from '@/constants/issue';
import { useIssueStore } from '@/store/issue';
import { theme } from '@/styles/theme';

const ProgressBar = () => {
  const status = useIssueStore((state) => state.status);
  const steps = STEP_FLOW.slice(0, -1);
  const currentIndex = STEP_FLOW.indexOf(status);

  return (
    <Container>
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isLineActive = index < currentIndex;
        return (
          <StepWrapper>
            <Circle isActive={isActive}>
              {index + 1}
              <Label isActive={isActive}>{STATUS_LABEL[step]}</Label>
            </Circle>
            <Line isActive={isLineActive} />
          </StepWrapper>
        );
      })}
    </Container>
  );
};

export default ProgressBar;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  margin-top: 16px;
`;

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;

  &:last-child {
    flex: 0;
  }
`;

const Circle = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radius.half};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.green[600] : theme.colors.gray[300]};
`;

const Label = styled.span<{ isActive: boolean }>`
  position: absolute;
  top: -65%;
  white-space: nowrap;
  font-size: ${theme.font.size.small};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.green[600] : theme.colors.gray[400])};
`;

const Line = styled.div<{ isActive: boolean }>`
  flex-grow: 1;
  height: 6px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.green[600] : theme.colors.gray[300]};
`;
