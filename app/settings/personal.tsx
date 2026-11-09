import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar, Button, Header, Input, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

export default function Personal() {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Please allow access in Settings to change your photo.');
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!r.canceled) setAvatar(r.assets[0].uri);
  };

  const choose = () =>
    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: () => pick(true) },
      { text: 'Choose from library', onPress: () => pick(false) },
      ...(avatar ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => setAvatar(undefined) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  const save = async () => {
    setError('');
    if (!name.trim()) return setError('Name can\'t be empty.');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email, phone: phone.trim(), location: location.trim(), bio: bio.trim(), avatar });
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header title="Personal information" />
      <Pressable onPress={choose} style={{ alignSelf: 'center', marginVertical: 16 }} accessibilityLabel="Change profile photo">
        <Avatar uri={avatar} name={name} size={104} />
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg }}>
          <Ionicons name="camera" size={16} color={colors.onPrimary} />
        </View>
      </Pressable>
      <View style={{ gap: 14 }}>
        <Input label="Legal name" icon="person-outline" value={name} onChangeText={setName} />
        <Input label="Email address" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Phone number" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 555 000 0000" />
        <Input label="Lives in" icon="location-outline" value={location} onChangeText={setLocation} placeholder="City, Country" />
        <Input label="About you" value={bio} onChangeText={setBio} multiline placeholder="Tell hosts a little about yourself" maxLength={300} />
        {!!error && <T color={colors.danger}>{error}</T>}
      </View>
      <View style={{ flex: 1, minHeight: 20 }} />
      <Button title="Save changes" onPress={save} loading={saving} />
    </Screen>
  );
}
