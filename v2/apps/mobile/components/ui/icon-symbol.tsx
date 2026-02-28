import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

/**
 * Mapeamento de nomes de ícones (estilo SF Symbols) para MaterialIcons.
 */
const MAPPING: Record<string, string> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'menucard.fill': 'restaurant-menu',
  'clock.fill': 'history',
  'list.bullet': 'list-alt',
  'gearshape.fill': 'settings',
  'dollarsign.circle.fill': 'attach-money',
  'package.fill': 'inventory',
  'chart.bar.fill': 'bar-chart',
  'person.fill': 'person',
  'plus': 'add',
};

/**
 * Componente de ícone simplificado que mapeia nomes amigáveis para MaterialIcons.
 * Usamos React.createElement para evitar problemas de tipos JSX em certos ambientes.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = MAPPING[name] || 'help-outline';
  return React.createElement(MaterialIcons as any, {
    name: iconName,
    size,
    color,
    style,
  });
}
