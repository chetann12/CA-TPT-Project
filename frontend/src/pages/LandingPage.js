import React from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Logo from '../assets/LogoPlaceholder.svg';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;700&display=swap');
  body {
    font-family: 'Poppins', 'Roboto', Arial, sans-serif;
    margin: 0;
    background: #f7f9fb;
    color: #222;
  }
`;

const NAVY = '#1A237E';
const GREY = '#f5f6fa';
const DARK_GREY = '#333';

const Navbar = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(26,35,126,0.06);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  @media (max-width: 600px) {
    flex-direction: column;
    padding: 0.5rem 1rem;
  }
`;
const LogoImg = styled.img`
  height: 40px;
  margin-right: 1rem;
`;
const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  @media (max-width: 600px) {
    gap: 1rem;
    margin-top: 0.5rem;
  }
`;
const NavLink = styled.a`
  color: ${NAVY};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  &:hover {
    color: #3949ab;
  }
`;
const PortalButton = styled(Link)`
  background: ${NAVY};
  color: #fff;
  padding: 0.5rem 1.2rem;
  border-radius: 24px;
  font-weight: 600;
  text-decoration: none;
  margin-left: 1.5rem;
  transition: background 0.2s;
  &:hover {
    background: #3949ab;
  }
`;

const Hero = styled.section`
  background: linear-gradient(90deg, #1A237E 60%, #3949ab 100%);
  color: #fff;
  padding: 4rem 2rem 3rem 2rem;
  text-align: center;
`;
const Headline = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;
const Subheading = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
`;
const CTAButton = styled.a`
  background: #fff;
  color: ${NAVY};
  padding: 0.75rem 2rem;
  border-radius: 32px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(26,35,126,0.08);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #e3e7fa;
    color: #3949ab;
  }
`;

const Section = styled.section`
  padding: 3rem 2rem;
  background: ${props => props.bg || '#fff'};
  text-align: center;
`;
const SectionTitle = styled.h2`
  font-size: 2rem;
  color: ${NAVY};
  margin-bottom: 1.5rem;
`;
const AboutText = styled.p`
  max-width: 700px;
  margin: 0 auto 1rem auto;
  font-size: 1.1rem;
`;
const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;
const ServiceCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(26,35,126,0.06);
  padding: 2rem 1rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 6px 24px rgba(26,35,126,0.10);
  }
`;
const ServiceIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${NAVY};
`;
const WhyList = styled.ul`
  list-style: none;
  padding: 0;
  max-width: 700px;
  margin: 0 auto;
`;
const WhyItem = styled.li`
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;
const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;
const TeamCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(26,35,126,0.06);
  padding: 2rem 1rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const TeamPhoto = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e3e7fa;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${NAVY};
  overflow: hidden;
`;
const TeamName = styled.h3`
  margin: 0.5rem 0 0.2rem 0;
  font-size: 1.15rem;
  font-weight: 600;
`;
const TeamRole = styled.p`
  margin: 0 0 0.5rem 0;
  color: #3949ab;
  font-size: 1rem;
`;
const TeamBio = styled.p`
  font-size: 0.98rem;
  color: #444;
`;
const ContactInfo = styled.div`
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;
const ContactForm = styled.form`
  max-width: 400px;
  margin: 0 auto 1.5rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const Input = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #cfd8dc;
  font-size: 1rem;
`;
const Textarea = styled.textarea`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #cfd8dc;
  font-size: 1rem;
  min-height: 80px;
`;
const SubmitBtn = styled.button`
  background: ${NAVY};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #3949ab;
  }
`;
const MapPlaceholder = styled.div`
  width: 100%;
  max-width: 400px;
  height: 200px;
  background: #e3e7fa;
  border-radius: 12px;
  margin: 1rem auto 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3949ab;
  font-size: 1.1rem;
`;
const Footer = styled.footer`
  background: #1A237E;
  color: #fff;
  padding: 2rem 1rem 1rem 1rem;
  text-align: center;
  margin-top: 2rem;
`;
const FooterLinks = styled.div`
  margin-bottom: 1rem;
  a {
    color: #fff;
    margin: 0 1rem;
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
`;
const SocialIcons = styled.div`
  margin-bottom: 1rem;
  a {
    color: #fff;
    margin: 0 0.5rem;
    font-size: 1.3rem;
    transition: color 0.2s;
    &:hover {
      color: #e3e7fa;
    }
  }
`;

export default function LandingPage() {
  return (
    <>
      <GlobalStyle />
      <Navbar>
        <div style={{display:'flex',alignItems:'center'}}>
          <LogoImg src={Logo} alt="CA TPT & Associates Logo" />
          <span style={{fontWeight:700, color:NAVY, fontSize:'1.2rem'}}>CA TPT & Associates</span>
        </div>
        <NavLinks>
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#about">About Us</NavLink>
          <NavLink href="#services">Services</NavLink>
          <NavLink href="#team">Team</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          <PortalButton to="/dashboard">Client Portal</PortalButton>
        </NavLinks>
      </Navbar>
      <Hero id="home">
        <Headline>Empowering Growth with Trusted Financial Expertise</Headline>
        <Subheading>Chartered Accountants | Tax, Audit, Compliance &amp; Advisory Services</Subheading>
        <CTAButton href="#contact">Schedule a Consultation</CTAButton>
      </Hero>
      <Section id="about" bg={GREY}>
        <SectionTitle>About Us</SectionTitle>
        <AboutText>
          CA TPT &amp; Associates is a leading Chartered Accountancy firm with over 10 years of experience, serving startups, SMEs, and corporates. Our mission is to empower businesses with reliable financial guidance, compliance, and growth strategies.
        </AboutText>
        <AboutText>
          We combine deep industry knowledge with a client-centric approach, ensuring timely, transparent, and value-driven services for every client.
        </AboutText>
      </Section>
      <Section id="services">
        <SectionTitle>Our Services</SectionTitle>
        <ServicesGrid>
          <ServiceCard>
            <ServiceIcon>📊</ServiceIcon>
            <div>Audit &amp; Assurance</div>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>💼</ServiceIcon>
            <div>Taxation (Direct &amp; Indirect)</div>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>🧾</ServiceIcon>
            <div>GST Compliance</div>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>🏢</ServiceIcon>
            <div>Company Incorporation</div>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>📚</ServiceIcon>
            <div>Accounting &amp; Bookkeeping</div>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>📈</ServiceIcon>
            <div>Business Advisory</div>
          </ServiceCard>
        </ServicesGrid>
      </Section>
      <Section bg={GREY}>
        <SectionTitle>Why Choose Us</SectionTitle>
        <WhyList>
          <WhyItem>✅ Trusted by 500+ clients</WhyItem>
          <WhyItem>⏱️ Timely &amp; Transparent Service</WhyItem>
          <WhyItem>🏆 Industry-specific expertise</WhyItem>
        </WhyList>
      </Section>
      <Section id="team">
        <SectionTitle>Our Team</SectionTitle>
        <TeamGrid>
          <TeamCard>
            <TeamPhoto>AB</TeamPhoto>
            <TeamName>CA Amit Bansal</TeamName>
            <TeamRole>Managing Partner</TeamRole>
            <TeamBio>15+ years in audit, tax, and business advisory. Passionate about helping businesses grow with compliance and strategy.</TeamBio>
          </TeamCard>
          <TeamCard>
            <TeamPhoto>TP</TeamPhoto>
            <TeamName>CA Tarun Patel</TeamName>
            <TeamRole>Senior Partner</TeamRole>
            <TeamBio>Expert in GST, company law, and startup consulting. Known for client-first approach and technical expertise.</TeamBio>
          </TeamCard>
          <TeamCard>
            <TeamPhoto>RS</TeamPhoto>
            <TeamName>CA Ritu Sharma</TeamName>
            <TeamRole>Partner</TeamRole>
            <TeamBio>Specializes in accounting, compliance, and SME advisory. Dedicated to delivering timely, quality solutions.</TeamBio>
          </TeamCard>
        </TeamGrid>
      </Section>
      <Section id="contact" bg={GREY}>
        <SectionTitle>Contact Us</SectionTitle>
        <ContactInfo>
          <div>Office: 123 Finance Street, Mumbai, India</div>
          <div>Phone: +91 98765 43210</div>
          <div>Email: info@catptassociates.com</div>
        </ContactInfo>
        <ContactForm onSubmit={e => {e.preventDefault(); alert('Thank you for contacting us!')}}>
          <Input type="text" name="name" placeholder="Your Name" required />
          <Input type="email" name="email" placeholder="Your Email" required />
          <Textarea name="message" placeholder="Your Message" required />
          <SubmitBtn type="submit">Send Message</SubmitBtn>
        </ContactForm>
        <MapPlaceholder>Google Maps Location (Placeholder)</MapPlaceholder>
      </Section>
      <Footer>
        <FooterLinks>
          <a href="#home">Home</a>|
          <a href="#services">Services</a>|
          <a href="#contact">Contact</a>
        </FooterLinks>
        <SocialIcons>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i>🔗</a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i>🐦</a>
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i>📘</a>
        </SocialIcons>
        <div style={{marginBottom:'0.5rem'}}>Copyright © 2025 CA TPT &amp; Associates</div>
        <div>Designed with <span style={{color:'#e57373'}}>❤️</span> by Your Name or Agency</div>
      </Footer>
    </>
  );
} 