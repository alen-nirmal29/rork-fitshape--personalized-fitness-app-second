import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordField, setIsPasswordField] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Check if this is a password field
  React.useEffect(() => {
    setIsPasswordField(secureTextEntry || false);
  }, [secureTextEntry]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderRightIcon = () => {
    if (isPasswordField) {
      return (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconRight}>
          {showPassword ? <EyeOff size={20} color={Colors.dark.subtext} /> : <Eye size={20} color={Colors.dark.subtext} />}
        </TouchableOpacity>
      );
    }
    return rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      {isFocused ? (
        <LinearGradient
          colors={[Colors.dark.gradient.primary, Colors.dark.gradient.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorderWrapper}
        >
          <View style={styles.gradientBorderInner}>
            <View
              style={[
                styles.inputContainer,
                error ? styles.inputError : null,
                inputStyle,
                { borderColor: 'transparent' },
              ]}
            >
              {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
              <TextInput
                style={[
                  styles.input,
                  leftIcon ? styles.inputWithLeftIcon : null,
                  (rightIcon || isPasswordField) ? styles.inputWithRightIcon : null,
                ]}
                placeholderTextColor={Colors.dark.subtext}
                secureTextEntry={isPasswordField ? !showPassword : secureTextEntry}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...rest}
              />
              {renderRightIcon()}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.inputContainer,
            error ? styles.inputError : null,
            inputStyle,
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : null,
              (rightIcon || isPasswordField) ? styles.inputWithRightIcon : null,
            ]}
            placeholderTextColor={Colors.dark.subtext}
            secureTextEntry={isPasswordField ? !showPassword : secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />
          {renderRightIcon()}
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: Colors.dark.text,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    paddingRight: 16,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
    marginTop: 4,
  },
  gradientBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    zIndex: 1,
    height: '100%',
    width: '100%',
    borderWidth: 1.5,
  },
  gradientBorderWrapper: {
    borderRadius: 14,
    padding: 1.5,
  },
  gradientBorderInner: {
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
  },
});