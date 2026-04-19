import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.mainTitle}>ASL Translator</ThemedText>
          <ThemedText style={styles.subtitle}>
            Breaking communication barriers through sign language translation
          </ThemedText>
        </View>

        {/* Main Features Grid */}
        <View style={styles.featuresContainer}>
          {/* ASL to English Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push('/asl-translation')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="hand-left" size={40} color={Colors.light.background} />
              </View>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                ASL → English
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              Translate fingerspelling and signs to English text. Start by showing the camera a sign.
            </ThemedText>
            <View style={styles.cardFooter}>
              <ThemedText style={styles.cardLabel}>Take a picture or video</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.background} />
            </View>
          </TouchableOpacity>

          {/* English to ASL Card (Coming Soon) */}
          <TouchableOpacity
            style={[styles.featureCard, styles.comingSoonCard]}
            disabled
            activeOpacity={0.6}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, styles.disabledIcon]}>
                <Ionicons name="text" size={40} color={Colors.light.background} />
              </View>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                English → ASL
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDescription}>
              Enter English text and see the corresponding ASL sign animation.
            </ThemedText>
            <View style={[styles.cardFooter, styles.comingSoonFooter]}>
              <ThemedText style={styles.comingSoonLabel}>Coming Soon</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={24} color={Colors.light.tint} />
            <View style={styles.infoContent}>
              <ThemedText type="subtitle" style={styles.infoTitle}>Current Focus</ThemedText>
              <ThemedText style={styles.infoText}>
                This prototype focuses on fingerspelling detection. Each letter of the ASL alphabet is recognized through hand position detection.
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.light.tint} />
            <View style={styles.infoContent}>
              <ThemedText type="subtitle" style={styles.infoTitle}>Privacy</ThemedText>
              <ThemedText style={styles.infoText}>
                Photos are sent only to your configured detection backend. If you self-host it, the
                images stay within your own network and infrastructure.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Dedicated to breaking communication barriers and promoting accessibility for Deaf individuals.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 16,
  },
  featureCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 20,
    minHeight: 240,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonCard: {
    backgroundColor: '#D0D0D0',
    opacity: 0.7,
  },
  cardHeader: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    color: Colors.light.background,
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  comingSoonFooter: {
    justifyContent: 'center',
  },
  comingSoonLabel: {
    color: Colors.light.background,
    fontSize: 13,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 32,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(168, 213, 186, 0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(168, 213, 186, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
