import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import {
  KeyboardAvoidingView,
  Platform,
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
const EAS_PROJECT_ID = process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  || Constants.expoConfig?.extra?.eas?.projectId
  || Constants.easConfig?.projectId;
const DIETS = [
  { id: 'vegetarian', label: 'Wegetariańska' },
  { id: 'vegan', label: 'Wegańska' },
  { id: 'gluten_free', label: 'Bez glutenu' },
  { id: 'lactose_free', label: 'Bez laktozy' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  return daysLabel(Math.round((target - today) / 86_400_000));
}

function formatAmount(amount) {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(amount);
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL.replace(/\/$/, ''));
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fridge, setFridge] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familySize, setFamilySize] = useState('1');
  const [diet, setDiet] = useState([]);
  const [notificationTime, setNotificationTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const request = useCallback(async (path, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api${path}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Serwer zwrócił błąd');
    return data;
  }, [apiUrl, token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [fridgeData, recommendationData] = await Promise.all([
        request('/fridge'),
        request('/recommendations'),
      ]);
      setFridge(fridgeData.items || []);
      setRecommendations(recommendationData.recommendations || []);
    } catch (e) {
      setError(`Nie udało się pobrać danych.\n${e.message}`);
      setFridge([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [request, token]);

  useEffect(() => {
    SecureStore.getItemAsync('sessionToken')
      .then((savedToken) => {
        if (savedToken) setToken(savedToken);
        else setBooting(false);
      })
      .catch((e) => {
        setError(`Nie udało się odczytać zapisanej sesji.\n${e.message}`);
        setBooting(false);
      });
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    request('/auth/me')
      .then((userProfile) => {
        if (!active) return;
        setProfile(userProfile);
        setFamilySize(String(userProfile.familySize));
        setDiet(userProfile.diet || []);
        setNotificationTime(userProfile.notificationTime || '');
        setTimezone(userProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
        return load();
      })
      .catch(async (e) => {
        if (!active) return;
        setError(`Nie udało się przywrócić sesji.\n${e.message}`);
        await SecureStore.deleteItemAsync('sessionToken');
        setToken(null);
        setProfile(null);
      })
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
  }, [load, request, token]);

  const authenticate = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Nie udało się zalogować');
      await SecureStore.setItemAsync('sessionToken', data.token);
      setProfile(data.profile);
      setToken(data.token);
      setFamilySize(String(data.profile.familySize));
      setDiet(data.profile.diet || []);
      setNotificationTime(data.profile.notificationTime || '');
      setTimezone(data.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setError('');
    setLoading(true);
    try {
      const size = Number(familySize);
      if (!Number.isInteger(size) || size < 1 || size > 20) {
        throw new Error('Liczba domowników musi wynosić od 1 do 20.');
      }

      const update = {
        familySize: size,
        diet,
        notificationTime: notificationTime.trim() || null,
        timezone,
      };
      let pushSetupError = '';
      if (update.notificationTime) {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(update.notificationTime)) {
          throw new Error('Godzinę przypomnienia wpisz w formacie HH:mm.');
        }
        if (!EAS_PROJECT_ID) {
          pushSetupError = 'Aby włączyć push, ustaw EXPO_PUBLIC_EAS_PROJECT_ID i użyj development build.';
        } else {
          try {
            const permission = await Notifications.requestPermissionsAsync();
            if (permission.status !== 'granted') {
              pushSetupError = 'Brak zgody na powiadomienia w ustawieniach telefonu.';
            } else {
              if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                  name: 'Przypomnienia o obiedzie',
                  importance: Notifications.AndroidImportance.DEFAULT,
                });
              }
              const pushToken = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
              update.expoPushToken = pushToken.data;
            }
          } catch (e) {
            pushSetupError = e.message;
          }
        }
      } else {
        update.expoPushToken = null;
      }
      const saved = await request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(update),
      });
      setProfile(saved);
      await load();
      if (pushSetupError) {
        setError(`Profil zapisany, ale powiadomienia push nie są aktywne.\n${pushSetupError}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError('');
    try {
      await request('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
      await SecureStore.deleteItemAsync('sessionToken');
      setToken(null);
      setProfile(null);
      setFridge([]);
      setRecommendations([]);
      setSelectedRecipe(null);
    } catch (e) {
      setError(`Nie udało się wylogować.\n${e.message}`);
    }
  };

  const toggleDiet = (id) => {
    setDiet((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Text style={styles.empty}>Ładowanie profilu…</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Moja lodówka</Text>
            <Text style={styles.subtitle}>Zaloguj się, aby zobaczyć obiady dopasowane do Twojego domu.</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Adres serwera</Text>
              <TextInput value={apiUrl} onChangeText={setApiUrl} style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://192.168.1.20:3001" />
              <Text style={[styles.label, styles.fieldLabel]}>E-mail</Text>
              <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
              <Text style={[styles.label, styles.fieldLabel]}>Hasło</Text>
              <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={authenticate} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Chwila…' : authMode === 'register' ? 'Utwórz konto' : 'Zaloguj się'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={styles.linkButton}>
                <Text style={styles.linkText}>{authMode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {selectedRecipe ? (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedRecipe(null)}>
              <Text style={styles.linkText}>‹ Wróć do obiadów</Text>
            </TouchableOpacity>
            <View style={styles.recipeCard}>
              <Text style={styles.detailEmoji}>{selectedRecipe.emoji}</Text>
              <Text style={styles.title}>{selectedRecipe.name}</Text>
              <Text style={styles.subtitle}>{selectedRecipe.time} min · {selectedRecipe.difficulty} · dla {profile?.familySize || 1} osób</Text>
              <Text style={styles.sectionTitle}>Składniki</Text>
              {selectedRecipe.ingredients.map((ingredient) => (
                <Text key={ingredient.name} style={styles.detailLine}>
                  • {ingredient.name} — {formatAmount(ingredient.amount * (profile?.familySize || 1) / selectedRecipe.servings)} {ingredient.unit}
                </Text>
              ))}
              <Text style={[styles.sectionTitle, styles.instructionsTitle]}>Przygotowanie</Text>
              {selectedRecipe.steps.map((step, index) => (
                <View key={`${selectedRecipe.id}-${index}`} style={styles.instructionRow}>
                  <Text style={styles.instructionNumber}>{index + 1}.</Text>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Obiad na dziś</Text>
            <Text style={styles.subtitle}>Propozycje dopasowane do lodówki i preferencji domowników</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.card}>
              <View style={styles.profileHeader}>
                <View style={styles.profileText}>
                  <Text style={styles.sectionTitle}>Profil użytkownika</Text>
                  <Text style={styles.muted}>{profile?.email}</Text>
                </View>
                <TouchableOpacity onPress={signOut}>
                  <Text style={styles.linkText}>Wyloguj</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, styles.fieldLabel]}>Liczba domowników</Text>
              <TextInput value={familySize} onChangeText={setFamilySize} style={styles.input} keyboardType="number-pad" />
              <Text style={[styles.label, styles.fieldLabel]}>Dieta (możesz wybrać kilka)</Text>
              <View style={styles.chips}>
                {DIETS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleDiet(option.id)}
                    style={[styles.chip, diet.includes(option.id) && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, diet.includes(option.id) && styles.chipTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, styles.fieldLabel]}>Codzienne przypomnienie o obiedzie (HH:mm, puste = wyłączone)</Text>
              <TextInput value={notificationTime} onChangeText={setNotificationTime} style={styles.input} placeholder="np. 17:00" keyboardType="numbers-and-punctuation" />
              <Text style={styles.muted}>Strefa czasowa: {timezone}</Text>
              <Text style={styles.muted}>Powiadomienia push: {profile?.notificationsEnabled ? 'aktywne' : 'nieaktywne — zapisz profil, aby włączyć'}</Text>
              <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={loading}>
                <Text style={styles.buttonText}>Zapisz profil</Text>
              </TouchableOpacity>
            </View>

            {recommendations.map((recipe, index) => (
              <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => setSelectedRecipe(recipe)} activeOpacity={0.85}>
                <View style={styles.recipeHeader}>
                  <Text style={styles.emoji}>{recipe.emoji}</Text>
                  <View style={styles.recipeTitleBlock}>
                    <Text style={styles.recipeNumber}>#{index + 1}</Text>
                    <Text style={styles.recipeTitle}>{recipe.name}</Text>
                    <Text style={styles.meta}>{recipe.time} min · {recipe.difficulty} · dopasowanie {recipe.coverage}%</Text>
                  </View>
                </View>
                {recipe.matched.length > 0 && <Text style={styles.sectionText}>Masz: {recipe.matched.join(', ')}</Text>}
                {recipe.missing.length > 0 && <Text style={styles.missingText}>Brakuje: {recipe.missing.join(', ')}</Text>}
                {recipe.urgentDays < 365 && <Text style={styles.urgentText}>Najpilniejszy składnik: {daysLabel(recipe.urgentDays)}</Text>}
                <Text style={styles.linkText}>Zobacz składniki i przygotowanie ›</Text>
              </TouchableOpacity>
            ))}

            {!loading && !error && recommendations.length === 0 && (
              <Text style={styles.empty}>Brak obiadów pasujących do wybranej diety. Zmień preferencje w profilu.</Text>
            )}

            {fridge.length > 0 && (
              <View style={styles.card}>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f1' },
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#18342a', marginTop: 8 },
  subtitle: { color: '#68766f', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12 },
  label: { color: '#68766f', marginBottom: 6, fontSize: 13 },
  fieldLabel: { marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#dce3dc', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: '#18342a' },
  button: { backgroundColor: '#2f7d5b', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  linkButton: { alignItems: 'center', paddingTop: 16 },
  linkText: { color: '#2f7d5b', fontWeight: '700', marginTop: 8 },
  error: { backgroundColor: '#fff0ee', color: '#9c3d32', borderRadius: 12, padding: 12, marginBottom: 12 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileText: { flex: 1 },
  muted: { color: '#68766f', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#18342a', marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#dce3dc', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  chipSelected: { backgroundColor: '#2f7d5b', borderColor: '#2f7d5b' },
  chipText: { color: '#38443f', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontWeight: '700' },
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
  detailEmoji: { fontSize: 56, textAlign: 'center' },
  detailLine: { color: '#38443f', marginBottom: 8, fontSize: 15 },
  instructionsTitle: { marginTop: 18 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  instructionNumber: { width: 28, color: '#2f7d5b', fontWeight: '800' },
  instructionText: { flex: 1, color: '#38443f', lineHeight: 21 },
  backButton: { paddingVertical: 8 },
  empty: { textAlign: 'center', color: '#68766f', padding: 20 },
  fridgeItem: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf0ec', paddingVertical: 8 },
  fridgeEmoji: { fontSize: 24, width: 36 },
  fridgeText: { flex: 1 },
  fridgeName: { fontWeight: '700', color: '#2f3834' },
  fridgeMeta: { color: '#68766f', fontSize: 12 },
});
