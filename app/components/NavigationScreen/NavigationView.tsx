import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import {
  NavigationViewProps,
  NavigationViewRef,
} from "./types/Navigation";

const NativeView: React.ComponentType<NavigationViewProps> =
  requireNativeViewManager("MapboxNavigation");

export default React.forwardRef<
NavigationViewRef,
  NavigationViewProps
>((props, ref) => {
  return <NativeView {...props} ref={ref} />;
});