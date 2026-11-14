import { useTextComponent } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import type React from "react";
import { createContext, type Ref, useContext, useMemo } from "react";
import {
  Platform,
  Text as RNText,
  type TextProps as RNTextProps,
  unstable_TextAncestorContext as TextAncestorContext,
} from "react-native";
import { tv } from "tailwind-variants";

const textVariants = tv({
  base: "font-sans text-foreground",
  variants: {
    variant: {
      HeadingLarge: "font-semibold text-2xl/[33.6px]",
      HeadingMedium: "font-semibold text-xl/[28.8px]",
      title: "font-bold text-2xl/[33.6px]",
      subtitle: "font-semibold text-[19px]",
      body: "font-normal text-sm/[19.6px]",
      caption: "text-sm text-subtle-text",
      link: "font-medium text-accent text-sm underline",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export type AppTextProps = RNTextProps & {
  variant?: keyof typeof textVariants.variants.variant;
  children: React.ReactNode;
  ref?: Ref<React.ComponentRef<typeof RNText>>;
};

// React Native Web does not expose the native ancestor context.
const WebTextAncestorContext = createContext(false);

export const Text = ({
  variant = "body",
  className,
  style,
  ref,
  ...props
}: AppTextProps) => {
  const isNested = useContext(
    Platform.OS === "web" ? WebTextAncestorContext : TextAncestorContext
  );
  const { textProps } = useTextComponent();

  const resolvedClassName = useMemo(
    () =>
      isNested
        ? cn(className) // nested: skip variant, just inherit + apply any extra classes
        : cn(textVariants({ variant }), className), // top-level: apply full variant
    [variant, className, isNested]
  );

  const text = (
    <RNText
      {...textProps}
      accessibilityRole="text"
      accessible
      className={resolvedClassName}
      ref={ref}
      style={style}
      {...props}
    />
  );
  return Platform.OS === "web" ? (
    <WebTextAncestorContext.Provider value>
      {text}
    </WebTextAncestorContext.Provider>
  ) : (
    text
  );
};

Text.displayName = "Text";
