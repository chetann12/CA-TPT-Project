import React from 'react';
import styled from 'styled-components';
import Logo from '../assets/LogoPlaceholder.svg';

const NAVY = '#1A237E';

const HeaderBar = styled.header`
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(26,35,126,0.06);
  display: flex;
  align-items: center;
  padding: 0.5rem 2rem;
  z-index: 100;
  @media (max-width: 600px) {
    flex-direction: column;
    padding: 0.5rem 1rem;
  }
`;
const LogoImg = styled.img`
  height: 40px;
  margin-right: 1rem;
`;
const FirmName = styled.span`
  font-weight: 700;
  color: ${NAVY};
  font-size: 1.2rem;
`;

export default function FirmHeader() {
  return (
    <HeaderBar>
      <LogoImg src={Logo} alt="CA TPT & Associates Logo" />
      <FirmName>CA TPT & Associates</FirmName>
    </HeaderBar>
  );
} 