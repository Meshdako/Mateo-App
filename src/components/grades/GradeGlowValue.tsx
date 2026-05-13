import { useEffect, useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Anclas 1 → 4 → 7 (escala chilena). */
const RED = [0xe5, 0x39, 0x35] as const;
const YELLOW = [0xfd, 0xd8, 0x35] as const;
const GREEN = [0x2e, 0x7d, 0x32] as const;

const NEUTRAL = '#90A4AE';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const h = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * Color de tinta/sombra según la nota (1 rojo, 4 amarillo, 7 verde; valores intermedios interpolados).
 * Nota ≤ 0 o no finita: null (usar neutro).
 */
export function gradeToDisplayColor(grade: number): string | null {
  if (!Number.isFinite(grade) || grade <= 0) return null;
  const g = Math.min(7, Math.max(1, grade));
  let r: number;
  let gv: number;
  let b: number;
  if (g <= 4) {
    const t = (g - 1) / 3;
    r = lerp(RED[0], YELLOW[0], t);
    gv = lerp(RED[1], YELLOW[1], t);
    b = lerp(RED[2], YELLOW[2], t);
  } else {
    const t = (g - 4) / 3;
    r = lerp(YELLOW[0], GREEN[0], t);
    gv = lerp(YELLOW[1], GREEN[1], t);
    b = lerp(YELLOW[2], GREEN[2], t);
  }
  return rgbToHex(r, gv, b);
}

type GradeGlowValueProps = {
  /** Valor numérico de la nota (promedio o nota de fila). */
  grade: number;
  children: string;
  style?: StyleProp<TextStyle>;
  compact?: boolean;
};

const baseTone = (color: string, compact: boolean) => ({
  color,
  textShadowColor: color,
  textShadowOffset: { width: 0, height: 0 } as const,
  textShadowRadius: compact ? 6 : 8,
});

export default function GradeGlowValue({
  grade,
  children,
  style,
  compact = false,
}: GradeGlowValueProps) {
  const toneColor = useMemo(() => gradeToDisplayColor(grade) ?? NEUTRAL, [grade]);
  const pulse = Number.isFinite(grade) && grade > 0;

  const t = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse, t]);

  const rMin = compact ? 4 : 6;
  const rMax = compact ? 10 : 14;

  const glowPulse = useAnimatedStyle(() => ({
    textShadowRadius: interpolate(t.value, [0, 1], [rMin, rMax]),
  }));

  if (!pulse) {
    return (
      <Text style={[style, baseTone(toneColor, compact)]}>{children}</Text>
    );
  }

  return (
    <Animated.Text
      style={[
        style,
        {
          color: toneColor,
          textShadowColor: toneColor,
          textShadowOffset: { width: 0, height: 0 },
        },
        glowPulse,
      ]}
    >
      {children}
    </Animated.Text>
  );
}
