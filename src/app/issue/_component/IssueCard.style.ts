
import styled from '@emotion/styled';

const Card = styled.article`
  background: #ffffff; 
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(31, 41, 55, 0.06);
  border: 1px solid rgba(31,41,55,0.04);
  max-width: 30em;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Content = styled.h3`
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

export {
    Card,
    Header,
    Content,
}