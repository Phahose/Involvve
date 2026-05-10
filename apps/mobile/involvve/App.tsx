import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Supabase error:', error.message);
        setConnected(false);
      } else {
        setConnected(true);
      }
    }
    testConnection();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1F17' }}>
      <Text style={{ color: '#2D6A4F', fontSize: 32, fontWeight: 'bold' }}>INVOLVVE</Text>
      <Text style={{ color: '#52B788', fontSize: 16, marginTop: 16 }}>
        {connected === null && 'Connecting to Supabase...'}
        {connected === true && '✅ Supabase connected'}
        {connected === false && '❌ Connection failed'}
      </Text>
    </View>
  );
}