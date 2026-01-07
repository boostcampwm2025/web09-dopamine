import styled from '@emotion/styled';

export const Card = styled.div`
  width: 1000px;
  background: #ffffff;
  border: 2px solid #00A94F;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.12);
  padding: 18px 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

export const Badge = styled.div`
  display: inline-flex;
  gap: 17px;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  line-height: 1.5;
`;

export const Stats = styled.div`
  min-height: 80px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #F3F4F6;
  gap: 16px;
  width: 100%;
  text-align: center;
`;

export const Border = styled.div`
  width: 1px;
  height: 40px;
  background: #E5E7EB;
`;

export const LeftStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RightStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const VotesValue = styled.span`
  font-size: 30px;
  font-weight: 700;
  color: #00A94F;
  letter-spacing: 0.01em;
`;

export const CandidatesValue = styled.span`
  font-size: 30px;
  font-weight: 700;
  color: #1F2937;
  letter-spacing: 0.01em;
`;

export const StatLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;
