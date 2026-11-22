import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001';

function daysLabel(days) {
  if (days < 0) return `po terminie ${Math.abs(days)} dn.`;
  if (days === 0) return 'dziś';
  if (days === 1) return 'jutro';
  return `${days} dni`;
}

function quantityLabel(item) {
  if (item.unit === 'g') return `${item.qty} g`;
  if (item.unit === 'ml') return `${item.qty} ml`;
  return `${item.qty} szt.`;
}

function expiryLabel(item) {
  if (!item.expires) return 'bez daty';
  const [y, m, d] = item.expires.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86_400_000);
  return daysLabel(days);
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL.replace(/\/$/, ''));
  const [fridge, setFridge] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const base = apiUrl.replace(/\/$/, '');
      const [fridgeResponse, recommendationsResponse] = await Promise.all([
        fetch(`${base}/api/fridge`),
        fetch(`${base}/api/recommendations`),
      ]);
      if (!fridgeResponse.ok || !recommendationsResponse.ok) throw new Error('Serwer zwrócił błąd');
      const fridgeData = await fridgeResponse.json();
      const recommendationsData = await recommendationsResponse.json();
      setFridge(fridgeData.items || []);
      setRecommendations(recommendationsData.recommendations || []);
    } catch (e) {
      setError(`Nie udało się pobrać danych. Sprawdź adres IP i działanie serwera.\n${e.message}`);
      setFridge([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <Text style={styles.title}>Co dziś ugotować?</Text>
        <Text style={styles.subtitle}>Najlepsze 2 przepisy według lodówki i terminów ważności</Text>

        <View style={styles.apiCard}>
          <Text style={styles.label}>Adres serwera</Text>
          <TextInput
            value={apiUrl}
            onChangeText={setApiUrl}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="http://192.168.1.20:3001"
          />
          <TouchableOpacity style={styles.button} onPress={load}>
            <Text style={styles.buttonText}>Pobierz propozycje</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {recommendations.map((recipe, index) => (
          <View key={recipe.id} style={styles.recipeCard}>
            <View style={styles.recipeHeader}>
              <Text style={styles.emoji}>{recipe.emoji}</Text>
              <View style={styles.recipeTitleBlock}>
                <Text style={styles.recipeNumber}>#{index + 1}</Text>
                <Text style={styles.recipeTitle}>{recipe.name}</Text>
                <Text style={styles.meta}>{recipe.time} min · {recipe.difficulty} · dopasowanie {recipe.coverage}%</Text>
              </View>
            </View>

            {recipe.matched.length > 0 && (
              <Text style={styles.sectionText}>Masz: {recipe.matched.join(', ')}</Text>
            )}
            {recipe.missing.length > 0 && (
              <Text style={styles.missingText}>Brakuje: {recipe.missing.join(', ')}</Text>
            )}
            {recipe.urgentDays < 365 && (
              <Text style={styles.urgentText}>Najpilniejszy składnik: {daysLabel(recipe.urgentDays)}</Text>
            )}

            <View style={styles.steps}>
              {recipe.steps.map((step, stepIndex) => (
                <Text key={step} style={styles.step}>
                  {stepIndex + 1}. {step}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {!loading && !error && recommendations.length === 0 && (
          <Text style={styles.empty}>Dodaj produkty do lodówki, aby otrzymać propozycje.</Text>
        )}

        {fridge.length > 0 && (
          <View style={styles.fridgeCard}>
            <Text style={styles.sectionTitle}>Co jest w lodówce</Text>
            {fridge.map((item) => (
              <View key={item.id} style={styles.fridgeItem}>
                <Text style={styles.fridgeEmoji}>{item.emoji}</Text>
                <View style={styles.fridgeText}>
                  <Text style={styles.fridgeName}>{item.name}</Text>
                  <Text style={styles.fridgeMeta}>{quantityLabel(item)} · {expiryLabel(item)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f1' },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#18342a', marginTop: 8 },
  subtitle: { color: '#68766f', marginBottom: 16 },
  apiCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12 },
  label: { color: '#68766f', marginBottom: 6, fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#dce3dc', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  button: { backgroundColor: '#2f7d5b', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { backgroundColor: '#fff0ee', color: '#9c3d32', borderRadius: 12, padding: 12, marginBottom: 12 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#63a87f' },
  recipeHeader: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 42, marginRight: 12 },
  recipeTitleBlock: { flex: 1 },
  recipeNumber: { color: '#2f7d5b', fontWeight: '800', fontSize: 12 },
  recipeTitle: { fontSize: 20, fontWeight: '800', color: '#18342a' },
  meta: { color: '#68766f', fontSize: 12, marginTop: 2 },
  sectionText: { color: '#35634f', marginTop: 10 },
  missingText: { color: '#9a6722', marginTop: 4 },
  urgentText: { color: '#b04a3d', marginTop: 4, fontWeight: '700' },
  steps: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#edf0ec', paddingTop: 8 },
  step: { color: '#38443f', marginBottom: 5 },
  empty: { textAlign: 'center', color: '#68766f', padding: 20 },
  fridgeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#18342a', marginBottom: 6 },
  fridgeItem: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf0ec', paddingVertical: 8 },
  fridgeEmoji: { fontSize: 24, width: 36 },
  fridgeText: { flex: 1 },
  fridgeName: { fontWeight: '700', color: '#2f3834' },
  fridgeMeta: { color: '#68766f', fontSize: 12 },
});
