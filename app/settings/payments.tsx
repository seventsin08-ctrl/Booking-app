import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Card, Group, Header, Input, Pill, Row, Screen, T } from '@/components/ui';
import { formatMoney } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function brandOf(num: string) {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'Amex';
  if (/^6/.test(num)) return 'Discover';
  return 'Card';
}

function luhn(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return num.length >= 13 && sum % 10 === 0;
}

export default function Payments() {
  const { colors } = useTheme();
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPayment, myBookings, settings } = useStore();
  const [adding, setAdding] = useState(false);
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  const spent = myBookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total, 0);

  const save = () => {
    setError('');
    const digits = number.replace(/\D/g, '');
    if (!holder.trim()) return setError('Enter the name on the card.');
    if (!luhn(digits)) return setError('That card number doesn\'t look right.');
    const m = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return setError('Expiry must be MM/YY.');
    const expDate = new Date(2000 + Number(m[2]), Number(m[1]), 0);
    if (expDate < new Date()) return setError('This card has expired.');
    if (!/^\d{3,4}$/.test(cvc)) return setError('Enter the 3 or 4 digit security code.');
    // Only the brand and last 4 digits are kept — never the full number or CVC.
    addPaymentMethod({ brand: brandOf(digits), last4: digits.slice(-4), exp, holder: holder.trim() });
    setAdding(false); setHolder(''); setNumber(''); setExp(''); setCvc('');
  };

  const remove = (id: string) => {
    if (Platform.OS === 'web') return removePaymentMethod(id);
    Alert.alert('Remove card?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePaymentMethod(id) },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header title="Payments" />
      <Card style={{ marginVertical: 12, backgroundColor: colors.primary }}>
        <T variant="caption" color={colors.onPrimary} style={{ opacity: 0.7 }}>Total spent on trips</T>
        <T variant="large" color={colors.onPrimary}>{formatMoney(spent, settings.currency)}</T>
      </Card>
      <Group title="Payment methods" footer="Only your card brand and last 4 digits are stored on this device.">
        {paymentMethods.map((p) => (
          <Row
            key={p.id}
            icon="card-outline"
            title={`${p.brand} •••• ${p.last4}`}
            subtitle={`${p.holder} · Expires ${p.exp}`}
            right={p.isDefault ? <Pill label="Default" tone="dark" /> : undefined}
            onPress={() =>
              Platform.OS === 'web'
                ? setDefaultPayment(p.id)
                : Alert.alert(`${p.brand} •••• ${p.last4}`, undefined, [
                    ...(!p.isDefault ? [{ text: 'Set as default', onPress: () => setDefaultPayment(p.id) }] : []),
                    { text: 'Remove', style: 'destructive' as const, onPress: () => remove(p.id) },
                    { text: 'Cancel', style: 'cancel' as const },
                  ])
            }
          />
        ))}
        {paymentMethods.length === 0 && <Row icon="alert-circle-outline" title="No cards yet" chevron={false} />}
      </Group>

      {adding ? (
        <Card style={{ gap: 12 }}>
          <T variant="headline">Add card</T>
          <Input label="Name on card" value={holder} onChangeText={setHolder} autoComplete="name" />
          <Input label="Card number" icon="card-outline" value={number} keyboardType="number-pad" maxLength={23} placeholder="4242 4242 4242 4242"
            onChangeText={(t) => setNumber(t.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))} autoComplete="cc-number" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input label="Expiry" value={exp} placeholder="MM/YY" keyboardType="number-pad" maxLength={5}
                onChangeText={(t) => { const d = t.replace(/\D/g, ''); setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d); }} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="CVC" value={cvc} onChangeText={setCvc} keyboardType="number-pad" maxLength={4} secure />
            </View>
          </View>
          {!!error && <T color={colors.danger}>{error}</T>}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setAdding(false)} />
            <Button title="Save card" style={{ flex: 1 }} onPress={save} />
          </View>
        </Card>
      ) : (
        <Button title="Add payment method" icon="add" variant="secondary" onPress={() => setAdding(true)} />
      )}
    </Screen>
  );
}
