'use client';

import { useVariant } from './context/VariantContext';
import V1ZenGarden from './variants/v1';
import V2Workshop from './variants/v2';
import V3Conversation from './variants/v3';
import V4Blueprint from './variants/v4';
import V5StoryScroll from './variants/v5';
import V6Origami from './variants/v6';
import V7Instrument from './variants/v7';
import V8SplitView from './variants/v8';
import V9MapView from './variants/v9';
import V10Ritual from './variants/v10';

const variants: Record<number, React.ComponentType> = {
  1: V1ZenGarden,
  2: V2Workshop,
  3: V3Conversation,
  4: V4Blueprint,
  5: V5StoryScroll,
  6: V6Origami,
  7: V7Instrument,
  8: V8SplitView,
  9: V9MapView,
  10: V10Ritual,
};

export default function Home() {
  const { variant } = useVariant();
  const Component = variants[variant] || V1ZenGarden;
  return <Component />;
}
