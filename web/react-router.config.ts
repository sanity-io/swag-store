import type {Config} from "@react-router/dev/config";
import {hydrogenPreset} from "@shopify/hydrogen/react-router-preset";

export default {
  presets: [hydrogenPreset()],
} satisfies Config;