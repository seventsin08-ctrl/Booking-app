import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Button, Card, Group, Header, Input, Row, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function Security() {
  const { user, changePassword, deleteAccount, signOut } = useAuth();
  const { colors } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteErr, setDeleteErr] = useState('');

  const update = async () => {
    setMsg(null);
    if (next !== confirm) return setMsg({ ok: false, text: 'New passwords don\'t match.' });
    setLoading(true);
    try {
      await changePassword(current, next);
      setCurrent(''); setNext(''); setConfirm('');
      setMsg({ ok: true, text: 'Password updated.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setDeleteErr('');
    const go = async () => {
      try {
        await deleteAccount(deletePw);
      } catch (e) {
        setDeleteErr((e as Error).message);
      }
    };
    if (Platform.OS === 'web') return go();
    Alert.alert('Delete account?', 'This permanently removes your profile, wishlists and messages from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header title="Login & security" />
      <T variant="title2" style={{ marginVertical: 12 }}>Change password</T>
      <View style={{ gap: 12 }}>
        <Input label="Current password" secure value={current} onChangeText={setCurrent} textContentType="password" />
        <Input label="New password" secure value={next} onChangeText={setNext} textContentType="newPassword" placeholder="8+ characters, letters & numbers" />
        <Input label="Confirm new password" secure value={confirm} onChangeText={setConfirm} textContentType="newPassword" />
        {msg && <T color={msg.ok ? colors.success : colors.danger}>{msg.text}</T>}
        <Button title="Update password" onPress={update} loading={loading} disabled={!current || !next} />
      </View>

      <View style={{ height: 28 }} />
      <Group title="Account" footer="Your password is stored as a salted SHA-256 hash and never leaves this device.">
        <Row icon="mail-outline" title="Login email" value={user?.email} chevron={false} />
        <Row icon="calendar-outline" title="Member since" value={user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} chevron={false} />
        <Row icon="log-out-outline" title="Log out of this device" onPress={signOut} />
      </Group>

      <Card style={{ gap: 12, borderWidth: 1, borderColor: colors.dangerSoft }}>
        <T variant="headline" color={colors.danger}>Delete account</T>
        <T variant="callout" color={colors.textSecondary}>Enter your password to permanently delete your account.</T>
        <Input secure placeholder="Password" value={deletePw} onChangeText={setDeletePw} error={deleteErr} />
        <Button title="Delete my account" variant="danger" disabled={!deletePw} onPress={remove} />
      </Card>
    </Screen>
  );
}
