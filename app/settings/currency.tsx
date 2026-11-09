import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Group, Header, Row, Screen } from '@/components/ui';
import { CURRENCIES } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', 'Filipino', '日本語'];

export default function Currency() {
  const { settings, updateSettings } = useStore();
  const { colors } = useTheme();
  const check = <Ionicons name="checkmark" size={20} color={colors.text} />;
  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Language & currency" />
      <Group title="Currency" footer="Prices are converted from USD using approximate exchange rates.">
        {CURRENCIES.map((c) => (
          <Row key={c.code} title={`${c.name}`} subtitle={`${c.code} – ${c.symbol}`} chevron={false}
            right={settings.currency === c.code ? check : undefined} onPress={() => updateSettings({ currency: c.code })} />
        ))}
      </Group>
      <Group title="Preferred language" footer="Hosts will see your preferred language. More app translations are coming soon.">
        {LANGUAGES.map((l) => (
          <Row key={l} title={l} chevron={false} right={settings.language === l ? check : undefined} onPress={() => updateSettings({ language: l })} />
        ))}
      </Group>
    </Screen>
  );
}
