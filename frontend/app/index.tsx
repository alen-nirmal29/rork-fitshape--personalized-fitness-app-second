import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Image as RNImage } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dumbbell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { apiKey } from '@/firebase';
import { usePathname } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const clientId = '876432031351-8afvah33lup8au3vbc6c0brisqtap0l3.apps.googleusercontent.com';

export default function WelcomeScreen() {
  const { isAuthenticated, user, isInitialized, isInOnboarding } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const pathname = usePathname();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    // Do not set redirectUri here; let the provider handle it
  });

  // Log the redirect URI for debugging
  useEffect(() => {
    if (request) {
      // request.redirectUri is available on the request object
      console.log('Google Auth redirect URI:', request.redirectUri);
    }
  }, [request]);

  useEffect(() => {
    // Wait for the auth store to be initialized (rehydrated from storage)
    if (isInitialized) {
      setIsReady(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Only run this redirect logic on the root page
    if (pathname === '/' && isReady && isAuthenticated && user) {
      console.log('Index.tsx navigation check:', {
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        isInOnboarding,
        pathname
      });
      
      if (user.hasCompletedOnboarding) {
        // Use replace to avoid navigation stack issues
        router.replace('/(tabs)');
      } else {
        // Use replace to avoid navigation stack issues
        router.replace('/onboarding/profile');
      }
    }
  }, [isReady, isAuthenticated, user, pathname, isInOnboarding]);

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      (async () => {
        setLoading(true);
        setErrorState(null);
        try {
          const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postBody: `id_token=${response.params.id_token}&providerId=google.com`,
              requestUri: makeRedirectUri({ useProxy: true } as any),
              returnIdpCredential: true,
              returnSecureToken: true,
            }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          setLoading(false);
          setErrorState(null);
          router.replace('/onboarding/profile');
        } catch (e: any) {
          setErrorState(e.message || 'Google sign-in failed');
          setLoading(false);
        }
      })();
    }
  }, [response]);

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      await promptAsync({ useProxy: true });
    } catch (e) {
      setErrorState('Google signup error');
      setLoading(false);
    }
  };

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Don't show welcome screen if user is authenticated
  if (isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.dark.background, '#000']}
        style={styles.gradient}
      >
        <View style={{flex: 1}}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Dumbbell size={40} color={Colors.dark.gradient.primary} />
            </View>
            <Text style={styles.appName}>FitTransform</Text>
          </View>

          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', Colors.dark.background]}
              style={styles.imageOverlay}
            />
          </View>

          <Text style={styles.title}>Transform Your Body</Text>
          <Text style={styles.subtitle}>
            Personalized workout plans based on your body composition and fitness goals
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup} disabled={isLoading}>
            <RNImage
              source={require('../assets/images/google-logo.png')}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>{isLoading ? 'Signing up...' : 'Sign up with Google'}</Text>
          </TouchableOpacity>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            style={[styles.button, {minHeight: 64}]}
          />
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have account? </Text>
            <Text style={styles.loginLink} onPress={handleLogin}>Log in</Text>
          </View>
        </View>
        {error && <Text style={styles.loadingText}>{error}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.text,
    marginTop: 16,
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  heroContainer: {
    height: 400,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
    marginTop: -48, // Move title further up
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 8, // Reduce space below subtitle even more
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 0, // No space between buttons
    marginBottom: 32, // Move button group lower
    paddingTop: 16, // Add space above buttons to move them down
  },
  button: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 0, // No space below Google button
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'center',
    minWidth: 220,
    maxWidth: 320,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
  loginLink: {
    color: '#1976D2', // blue
    fontSize: 16,
    fontWeight: '500',
  },
});