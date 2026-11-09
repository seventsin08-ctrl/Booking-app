import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Header, Input, Screen, T, tap } from '@/components/ui';
import { EMAIL_RE, passwordIssues, useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function SignUp() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const issues = passwordIssues(password);

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!EMAIL_RE.test(email.trim())) return setError('Please enter a valid email address.');
    if (issues.length) return setError('Please choose a stronger password.');
    if (!agree) return setError('Please accept the Terms of Service to continue.');
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const rule = (label: string, ok: boolean) => (
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={ok ? colors.success : colors.textTertiary} />
      <T variant="caption" color={ok ? colors.text : colors.textSecondary}>{label}</T>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header />
      <View style={{ gap: 8, marginTop: 4, marginBottom: 24 }}>
        <T variant="large">Create account</T>
        <T color={colors.textSecondary}>Join Staymark to book stays and save your favourites.</T>
      </View>
      <View style={{ gap: 14 }}>
        <Input label="Full name" icon="person-outline" placeholder="Jane Appleseed" value={name} onChangeText={setName}
          autoComplete="name" textContentType="name" />
        <Input label="Email" icon="mail-outline" placeholder="you@example.com" value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        <Input label="Password" icon="lock-closed-outline" placeholder="Create a password" value={password} onChangeText={setPassword}
          secure autoComplete="new-password" textContentType="newPassword" />
        <View style={{ gap: 4, marginLeft: 4 }}>
          {rule('At least 8 characters', password.length >= 8)}
          {rule('Contains a letter and a number', /[A-Za-z]/.test(password) && /\d/.test(password))}
        </View>
        <Pressable
          onPress={() => { tap(); setAgree((a) => !a); }}
          style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 4 }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
        >
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={colors.text} />
          <T variant="callout" style={{ flex: 1 }} color={colors.textSecondary}>
            I agree to the Terms of Service, Payments Terms and Privacy Policy.
          </T>
        </Pressable>
        {!!error && <T variant="callout" color={colors.danger}>{error}</T>}
      </View>
      <View style={{ flex: 1, minHeight: 24 }} />
      <Button title="Agree and continue" onPress={submit} loading={loading} />
      <Pressable onPress={() => router.replace('/sign-in')} style={{ alignSelf: 'center', marginTop: 16 }} hitSlop={8}>
        <T variant="callout" color={colors.textSecondary}>
          Already have an account? <T variant="callout" style={{ fontWeight: '700' }}>Sign in</T>
        </T>
      </Pressable>
    </Screen>
  );
}
