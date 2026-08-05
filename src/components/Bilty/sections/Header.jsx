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
    name = "महाकाल",
    subtitle = "ट्रान्सपोर्ट",
    tagline = "आपली सेवा, आमची जबाबदारी",
    shree = "॥ श्री ॥",
    logo = "/LOGO.jpg",
    phones = ["9766149280", "8483817081"],
    branches = [
      { title: "शाखा - अ.नगर", address: "जुना दाणे डबरा, अ.नगर 9766149280" },
      { title: "शाखा - बीड", address: "जिजामाता चौक, जानुळे हॉस्पिटलजवळ" },
      { title: "शाखा - जामखेड", address: "खर्डा रोड, बोराटे वस्ती 9270848545" }
    ],
    serviceAreas = "अ.नगर • बीड • जामखेड • कडा • आष्टी • भूम • पाटोदा • खर्डा • इ.",

  } = company;

  const isOffice = type === "office";
  const ribbonText = isOffice ? "OFFICE COPY" : "CUSTOMER COPY";
  const ribbonClass = isOffice ? styles.copyRibbonOffice : styles.copyRibbon;

  return (
    <div className={styles.headerWrapper}>
      {/* 1. LEFT SECTION (~114mm) */}
      <div className={styles.logoCompanyBox}>
        <div className={styles.logoArea}>
          {logo ? (
            <img src={logo} alt="MTS Logo" className={styles.logoSvg} />
          ) : (
            <svg viewBox="0 0 100 100" className={styles.logoSvg}>
              <path d="M 18 24 L 18 12 M 14 12 L 14 18 C 14 21 22 21 22 18 L 22 12 M 18 8 L 18 12" stroke="#EB5A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 0 1 15 50" fill="none" stroke="#222222" strokeWidth="6" />
              <path d="M 10 50 A 40 40 0 0 1 85 30" fill="none" stroke="#EB5A00" strokeWidth="4" strokeDasharray="6 3" />
              <rect x="35" y="40" width="26" height="18" fill="#222222" rx="2" />
              <path d="M 61 45 L 72 45 L 75 50 L 75 58 L 61 58 Z" fill="#222222" />
              <circle cx="43" cy="58" r="4.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2.5" />
              <circle cx="67" cy="58" r="4.5" fill="#FFFFFF" stroke="#222222" strokeWidth="2.5" />
              <text x="50" y="80" textAnchor="middle" fill="#EB5A00" fontSize="22" fontWeight="900" fontFamily="sans-serif">MTS</text>
              <path d="M 25 86 L 70 86 M 65 82 L 72 86 L 65 90" stroke="#EB5A00" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className={styles.companyInfo}>
          <div className={styles.shree}>{shree}</div>
          <div className={styles.companyName}>{name}</div>

          <div className={styles.subtitleWrapper}>
            <div className={styles.subLine} />
            <div className={styles.subtitle}>{subtitle}</div>
            <div className={styles.subLine} />
          </div>

          <div className={styles.tagline}>{tagline}</div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION (~65mm) */}
      <div className={styles.branchBox}>
        <div className={styles.phonesRow}>
          {phones.map((phone, idx) => (
            <div key={idx} className={styles.phoneItem}>
              <div className={styles.phoneIconCircle}>
                <Phone size={10} strokeWidth={2.2} color="#222222" />
              </div>
              <span>{phone}</span>
            </div>
          ))}
        </div>

        <div className={styles.branchesList}>
          {branches.map((branch, idx) => (
            <div key={idx} className={styles.branchItem}>
              <MapPin size={12} strokeWidth={2.2} color="#EB5A00" className={styles.pinIcon} />
              <span className={styles.branchTitle}>{branch.title}</span>
              {branch.address && (
                <>
                  <span className={styles.colon}>:</span>
                  <span className={styles.branchAddress}>{branch.address}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Service Coverage */}
        <div className={styles.serviceRow}>
          <span className={styles.serviceTitle}>सेवा क्षेत्र :</span>
          <span className={styles.serviceLocations}>{serviceAreas}</span>
        </div>
      </div>

      {/* 3. BOOKING INFO CARD */}
      <BookingInfo booking={booking} />
    </div>
  );
};

export default Header;
