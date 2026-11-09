import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Header, Input, Screen, T } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function SignIn() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header />
      <View style={{ gap: 8, marginTop: 8, marginBottom: 28 }}>
        <Logo size={40} />
        <T variant="large" style={{ marginTop: 12 }}>Welcome back</T>
        <T color={colors.textSecondary}>Sign in to see your trips, wishlists and messages.</T>
      </View>
      <View style={{ gap: 14 }}>
        <Input label="Email" icon="mail-outline" placeholder="you@example.com" value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" returnKeyType="next" />
        <Input label="Password" icon="lock-closed-outline" placeholder="Your password" value={password} onChangeText={setPassword}
          secure autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
        <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
          <T variant="callout" style={{ fontWeight: '600', textDecorationLine: 'underline' }}>Forgot password?</T>
        </Pressable>
        {!!error && <T variant="callout" color={colors.danger}>{error}</T>}
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <Button title="Sign in" onPress={submit} loading={loading} />
      <Pressable onPress={() => router.replace('/sign-up')} style={{ alignSelf: 'center', marginTop: 16 }} hitSlop={8}>
        <T variant="callout" color={colors.textSecondary}>
          New to Staymark? <T variant="callout" style={{ fontWeight: '700' }}>Create an account</T>
        </T>
      </Pressable>
    </Screen>
  );
}
