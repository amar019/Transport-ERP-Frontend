import React, { useState, useEffect } from 'react';
import styles from './ReceiverSection.module.css';
import { transliterateToMarathi } from '../../../utils/transliterate';

/**
 * ReceiverSection Component (~126mm width)
 * Corporate ERP Consignee Card:
 * - Clear hierarchy: CONSIGNEE heading
 * - Name (High visual importance bold dark navy text)
 * - Mobile (Aligned label & value)
 * - Address (Aligned label & value)
 */

export const ReceiverSection = ({ customer = {}, deliveryAddress = "", receiver = {} }) => {
  const shopName = customer?.shopName || receiver?.shopName || receiver?.name || customer?.name || "-";
  const explicitMarathi = customer?.shopNameMarathi || receiver?.shopNameMarathi;
  const mobile = customer?.mobile || customer?.phone || receiver?.mobile || receiver?.phone || "-";

  const [marathiShopName, setMarathiShopName] = useState(explicitMarathi || '');

  useEffect(() => {
    let isMounted = true;

    if (explicitMarathi) {
      setMarathiShopName(explicitMarathi);
      return;
    }

    if (shopName && shopName !== '-') {
      transliterateToMarathi(shopName).then((translated) => {
        if (isMounted && translated) {
          setMarathiShopName(translated);
        }
      });
    } else {
      setMarathiShopName('');
    }

    return () => {
      isMounted = false;
    };
  }, [shopName, explicitMarathi]);

  // Format display: English shop name followed by Marathi in brackets
  const displayShopName = marathiShopName && marathiShopName !== shopName
    ? `${shopName} (${marathiShopName})`
    : shopName;

  // Build structured address from customer/receiver if available
  const customerFullAddress = [
    customer?.address || customer?.deliveryAddress,
    customer?.area,
    customer?.city
  ]
    .filter(Boolean)
    .join(", ");

  const receiverFullAddress = [
    receiver?.address || receiver?.deliveryAddress,
    receiver?.area,
    receiver?.city
  ]
    .filter(Boolean)
    .join(", ");

  const address =
    (deliveryAddress && typeof deliveryAddress === "string" && deliveryAddress.trim()) ||
    (customer?.deliveryAddress && typeof customer.deliveryAddress === "string" && customer.deliveryAddress.trim()) ||
    (customer?.address && typeof customer.address === "string" && customer.address.trim()) ||
    customerFullAddress ||
    (receiver?.deliveryAddress && typeof receiver.deliveryAddress === "string" && receiver.deliveryAddress.trim()) ||
    (receiver?.address && typeof receiver.address === "string" && receiver.address.trim()) ||
    receiverFullAddress ||
    "-";

  return (
    <div className={styles.receiverCard}>
      {/* Section Title */}
      <div className={styles.titleRow}>
        <span className={styles.titleEnglish}>CONSIGNEE</span>
      </div>

      {/* Details List */}
      <div className={styles.detailsList}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Name</span>
          <span className={styles.colon}>:</span>
          <span className={styles.nameValue}>{displayShopName}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Mobile</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{mobile}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Address</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{address}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiverSection;
