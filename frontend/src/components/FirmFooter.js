import React from 'react';
import styled from 'styled-components';

const FooterBar = styled.footer`
  background: #1A237E;
  color: #fff;
  padding: 2rem 1rem 1rem 1rem;
  text-align: center;
  margin-top: 2rem;
`;

export default function FirmFooter() {
  return (
    <FooterBar>
      <div style={{marginBottom:'0.5rem'}}>Copyright © 2025 CA TPT & Associates</div>
      <div>Designed with <span style={{color:'#e57373'}}>❤️</span> by Your Name or Agency</div>
    </FooterBar>
  );
} 