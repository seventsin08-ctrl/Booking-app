import React from 'react';
import { Header, Screen, T } from '@/components/ui';
import { useTheme } from '@/lib/theme';

const SECTIONS = [
  ['Terms of Service', 'By using Staymark you agree to book and host responsibly, to provide accurate information, and to respect house rules and local laws. Hosts are responsible for the accuracy of their listings.'],
  ['Payments', 'Prices include the nightly rate, cleaning fee, service fee and taxes shown before you confirm. Refunds follow the cancellation policy shown on each listing.'],
  ['Privacy Policy', 'Your account, trips, wishlists and messages are stored on your device. Passwords are salted and hashed; card numbers and security codes are never stored — only the brand and last four digits.'],
  ['Notifications', 'We only send notifications you enable in Settings → Notifications. You can turn them off at any time.'],
  ['Non-discrimination', 'Staymark is a community where everyone should feel welcome. Hosts may not decline guests based on race, religion, national origin, disability, sex, gender identity, sexual orientation or age.'],
];

export default function Legal() {
  const { colors } = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Terms & privacy" />
      {SECTIONS.map(([h, b]) => (
        <React.Fragment key={h}>
          <T variant="title2" style={{ marginTop: 18, marginBottom: 6 }}>{h}</T>
          <T color={colors.textSecondary}>{b}</T>
        </React.Fragment>
      ))}
    </Screen>
  );
}
