import React from 'react';
import { Phone, MapPin, Globe } from 'lucide-react';
import BookingInfo from './BookingInfo';
import styles from './Header.module.css';

/**
 * Header Component
 * Contains Company Section (Logo, Name, Subtitle, Tagline), Branch Contacts & Service Coverage,
 * Booking Info Card, and Right Panel (QR Payment Card + Corner Ribbon).
 * 
 * Accepts props: company, booking, type, qrCode, upiId
 */


export const Header = ({
  company = {},
  booking = {},
  type = "customer",
  qrCode = "",
  upiId = "mahakaltransport@okaxis"
}) => {
  const {
    name = "MAHAKAL",
    subtitle = "TRANSPORT",
    tagline = "Delivering Trust, Every Single Mile",
    shree = "॥ Shree ॥",
    logo = "/LOGO.jpg",
    phones = ["9766149280", "8483817081", "9270848545"],
    branches = [
      { title: "Ahilyanagar", address: "Juna Dane Dabra, Ahilyanagar" },
      { title: "Beed", address: "Jijamata Chowk" },
      { title: "Jamkhed", address: "Kharda Road" }
    ],
  } = company;

  return (
    <div className={styles.headerWrapper}>
      {/* 1. LEFT SECTION: Corporate Logo & Branding */}
      <div className={styles.logoCompanyBox}>
        <div className={styles.logoArea}>
          {logo ? (
            <img src={logo} alt="MTS Logo" className={styles.logoSvg} />
          ) : (
            <svg viewBox="0 0 100 100" className={styles.logoSvg}>
              <path d="M 18 24 L 18 12 M 14 12 L 14 18 C 14 21 22 21 22 18 L 22 12 M 18 8 L 18 12" stroke="#EA580C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 0 1 15 50" fill="none" stroke="#0F172A" strokeWidth="6" />
              <path d="M 10 50 A 40 40 0 0 1 85 30" fill="none" stroke="#EA580C" strokeWidth="4" strokeDasharray="6 3" />
              <rect x="35" y="40" width="26" height="18" fill="#0F172A" rx="2" />
              <path d="M 61 45 L 72 45 L 75 50 L 75 58 L 61 58 Z" fill="#0F172A" />
              <circle cx="43" cy="58" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              <circle cx="67" cy="58" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              <text x="50" y="80" textAnchor="middle" fill="#EA580C" fontSize="22" fontWeight="900" fontFamily="Inter, sans-serif">MTS</text>
            </svg>
          )}
        </div>

        <div className={styles.companyInfo}>
          <div className={styles.topMetaRow}>
            <span className={styles.shree}>{shree}</span>
          </div>
          <div className={styles.brandTitleRow}>
            <span className={styles.companyName}>MAHAKAL</span>
            <span className={styles.companySubtitle}>TRANSPORT</span>
          </div>
          <div className={styles.tagline}>{tagline}</div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Clean Contact & Branch Info Block */}
      <div className={styles.branchBox}>
        {/* Phone Contacts */}
        <div className={styles.infoRow}>
          <Phone size={11} strokeWidth={2.4} className={styles.infoIcon} />
          <span className={styles.infoLabel}>TEL:</span>
          <div className={styles.phoneNumbers}>
            {phones.map((phone, idx) => (
              <React.Fragment key={idx}>
                <span className={styles.phoneNumber}>{phone}</span>
                {idx < phones.length - 1 && <span className={styles.bullet}>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Branch Network */}
        <div className={styles.infoRow}>
          <MapPin size={11} strokeWidth={2.4} className={styles.infoIcon} />
          <span className={styles.infoLabel}>BRANCHES:</span>
          <div className={styles.branchPills}>
            {branches
              .map((b) => (typeof b === 'string' ? b : (b.title || b.name || '')).replace(/^Branch\s*-\s*/i, '').trim())
              .filter(Boolean)
              .map((city, idx, arr) => (
                <React.Fragment key={idx}>
                  <span className={styles.branchName}>{city}</span>
                  {idx < arr.length - 1 && <span className={styles.bullet}>•</span>}
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>

      {/* 3. RIGHT SECTION: Booking Info Card */}
      <BookingInfo booking={booking} />
    </div>
  );
};

export default Header;
