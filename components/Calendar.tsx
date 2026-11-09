import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parseISODate, toISODate } from '@/lib/data';
import { useTheme } from '@/lib/theme';
import { T, tap } from './ui';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({
  start, end, onChange, unavailable = new Set<string>(), maxMonthsAhead = 12,
}: {
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  unavailable?: Set<string>;
  maxMonthsAhead?: number;
}) {
  const { colors } = useTheme();
  const today = toISODate(new Date());
  const initial = start ? parseISODate(start) : new Date();
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const now = new Date();
  const minMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const maxMonth = new Date(now.getFullYear(), now.getMonth() + maxMonthsAhead, 1);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (string | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= days; d++) out.push(toISODate(new Date(month.getFullYear(), month.getMonth(), d)));
    while (out.length % 7) out.push(null);
    return out;
  }, [month]);

  const rangeFree = (a: string, b: string) => {
    const d = parseISODate(a);
    const B = parseISODate(b);
    while (d < B) {
      if (unavailable.has(toISODate(d))) return false;
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  const press = (iso: string) => {
    tap();
    if (!start || (start && end) || iso <= start) {
      if (unavailable.has(iso)) return;
      onChange(iso, null);
      return;
    }
    if (rangeFree(start, iso)) onChange(start, iso);
    else if (!unavailable.has(iso)) onChange(iso, null);
  };

  const shift = (d: number) => {
    const n = new Date(month.getFullYear(), month.getMonth() + d, 1);
    if (n < minMonth || n > maxMonth) return;
    tap();
    setMonth(n);
  };

  return (
    <View>
      <View style={styles.head}>
        <Pressable onPress={() => shift(-1)} hitSlop={10} accessibilityLabel="Previous month" style={{ opacity: month <= minMonth ? 0.25 : 1 }}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <T variant="headline">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</T>
        <Pressable onPress={() => shift(1)} hitSlop={10} accessibilityLabel="Next month" style={{ opacity: month >= maxMonth ? 0.25 : 1 }}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {DOW.map((d) => (
          <View key={d} style={styles.cell}>
            <T variant="caption" color={colors.textSecondary}>{d}</T>
          </View>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <View key={i} style={styles.cell} />;
          const past = iso < today;
          const blocked = unavailable.has(iso);
          const isStart = iso === start;
          const isEnd = iso === end;
          const inRange = !!(start && end && iso > start && iso < end);
          const disabled = past || (blocked && !(start && !end && iso > start && rangeFree(start, iso)));
          const selected = isStart || isEnd;
          return (
            <View key={i} style={styles.cell}>
              {(inRange || (isStart && end) || isEnd) && (
                <View
                  style={[
                    styles.band,
                    { backgroundColor: colors.elevated },
                    isStart && { left: '50%' },
                    isEnd && { right: '50%' },
                  ]}
                />
              )}
              <Pressable
                disabled={disabled}
                onPress={() => press(iso)}
                accessibilityLabel={iso}
                style={[
                  styles.day,
                  { backgroundColor: selected ? colors.primary : inRange ? 'transparent' : colors.elevated },
                  iso === today && !selected && { borderWidth: 1.2, borderColor: colors.text },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14, fontWeight: selected ? '700' : '500',
                    color: selected ? colors.onPrimary : disabled ? colors.textTertiary : colors.text,
                    textDecorationLine: blocked && !past ? 'line-through' : 'none',
                  }}
                >
                  {parseISODate(iso).getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2.5 },
  day: { width: '100%', height: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', top: 2.5, bottom: 2.5, left: 0, right: 0 },
});
