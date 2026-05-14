import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

export const settings = {
  background: '#f8f8f8',
  lineBackground: '#e0e0e0',
  foreground: '#111111',
  muted: '#666666',
  caret: '#b59132',
  selection: '#b5913240',
  selectionMatch: '#b5913226',
  lineHighlight: '#b591321a',
  gutterBackground: 'transparent',
  gutterForeground: '#999999',
};

export default createTheme({
  theme: 'light',
  settings,
  styles: [
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#b59132' },
    { tag: t.labelName, color: '#b59132' },
    { tag: t.keyword, color: '#b59132' },
    { tag: t.operator, color: '#b59132' },
    { tag: t.special(t.variableName), color: '#8c6c19' },
    { tag: t.typeName, color: '#8c6c19' },
    { tag: t.atom, color: '#8c6c19' },
    { tag: t.number, color: '#8c6c19' },
    { tag: t.definition(t.variableName), color: '#111111' },
    { tag: t.string, color: '#8c6c19' },
    { tag: t.special(t.string), color: '#8c6c19' },
    { tag: t.comment, color: '#666666' },
    { tag: t.variableName, color: '#111111' },
    { tag: t.tagName, color: '#b59132' },
    { tag: t.bracket, color: '#666666' },
    { tag: t.meta, color: '#b59132' },
    { tag: t.attributeName, color: '#8c6c19' },
    { tag: t.propertyName, color: '#111111' },
    { tag: t.className, color: '#8c6c19' },
    { tag: t.invalid, color: '#d9534f' },
    { tag: [t.unit, t.punctuation], color: '#666666' },
  ],
});
