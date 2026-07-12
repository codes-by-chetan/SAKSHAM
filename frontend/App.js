import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mahila Bachatgat</Text>
        <Text style={styles.subtitle}>Expense and savings management for your group</Text>
        <Text style={styles.body}>
          This app is ready for login, group creation, contribution tracking, and expense management.
        </Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3a8c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
