import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large'
}) => {
  const getButtonStyle = () => {
    let style = [styles.button];
    
    // Variant styles
    if (variant === 'primary') {
      style.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      style.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      style.push(styles.outlineButton);
    }
    
    // Size styles
    if (size === 'small') {
      style.push(styles.smallButton);
    } else if (size === 'medium') {
      style.push(styles.mediumButton);
    } else {
      style.push(styles.largeButton);
    }
    
    // Disabled style
    if (disabled || loading) {
      style.push(styles.disabledButton);
    }
    
    return style;
  };

  const getTextStyle = () => {
    let style = [styles.text];
    
    if (variant === 'outline') {
      style.push(styles.outlineText);
    }
    
    if (size === 'small') {
      style.push(styles.smallText);
    } else if (size === 'medium') {
      style.push(styles.mediumText);
    }
    
    return style;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#6B4EFF' : '#fff'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6B4EFF',
  },
  secondaryButton: {
    backgroundColor: '#FF6B4E',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B4EFF',
  },
  largeButton: {
    height: 55,
  },
  mediumButton: {
    height: 45,
  },
  smallButton: {
    height: 35,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    color: '#fff',
  },
  outlineText: {
    color: '#6B4EFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
});