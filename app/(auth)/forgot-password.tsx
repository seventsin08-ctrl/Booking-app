import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Header, Input, Screen, T } from '@/components/ui';
import { EMAIL_RE, useAuth } from '@/lib/auth';
import { pushNow } from '@/lib/notify';
import { useTheme } from '@/lib/theme';

export default function ForgotPassword() {
  const { resetPassword, setNewPassword } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setError('');
    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address.');
    setLoading(true);
    const exists = await resetPassword(email);
    setLoading(false);
    if (!exists) return setError('We couldn\'t find an account with that email.');
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setSent(c);
    setStep('code');
    // Accounts live on this device, so the code is delivered as a device notification.
    await pushNow('Staymark verification code', `Your code is ${c}. It expires in 10 minutes.`);
    if (Platform.OS === 'web') Alert.alert('Verification code', c);
  };

  const confirm = async () => {
    setError('');
    if (code.trim() !== sent) return setError('That code isn\'t right. Check your notifications.');
    setLoading(true);
    try {
      await setNewPassword(email, pw);
      setStep('done');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header />
      {step === 'email' && (
        <>
          <T variant="large" style={{ marginTop: 4 }}>Reset password</T>
          <T color={colors.textSecondary} style={{ marginTop: 8, marginBottom: 24 }}>
            Enter the email you signed up with and we'll send you a 6-digit verification code.
          </T>
          <Input label="Email" icon="mail-outline" placeholder="you@example.com" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" error={error} />
          <View style={{ flex: 1, minHeight: 24 }} />
          <Button title="Send code" onPress={send} loading={loading} />
        </>
      )}
      {step === 'code' && (
        <>
          <T variant="large" style={{ marginTop: 4 }}>Check your notifications</T>
          <T color={colors.textSecondary} style={{ marginTop: 8, marginBottom: 24 }}>
            We sent a code to this device for {email.trim()}.
          </T>
          <View style={{ gap: 14 }}>
            <Input label="Verification code" icon="keypad-outline" placeholder="123456" value={code} onChangeText={setCode}
              keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode" />
            <Input label="New password" icon="lock-closed-outline" placeholder="8+ characters, letters & numbers" value={pw}
              onChangeText={setPw} secure textContentType="newPassword" />
            {!!error && <T variant="callout" color={colors.danger}>{error}</T>}
          </View>
          <View style={{ flex: 1, minHeight: 24 }} />
          <Button title="Update password" onPress={confirm} loading={loading} />
          <Button title="Resend code" variant="ghost" onPress={send} style={{ marginTop: 6 }} />
        </>
      )}
      {step === 'done' && (
        <>
          <Card style={{ marginTop: 40, alignItems: 'center', gap: 10, paddingVertical: 32 }}>
            <T variant="title" center>Password updated</T>
            <T color={colors.textSecondary} center>You can now sign in with your new password.</T>
          </Card>
          <View style={{ flex: 1 }} />
          <Button title="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </>
      )}
    </Screen>
  );
}
