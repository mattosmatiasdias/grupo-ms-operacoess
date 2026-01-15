// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas. Usando dados mockados.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Função para testar a conexão
export async function testConnection() {
  if (!supabase) {
    console.log('Supabase não configurado')
    return { error: 'Supabase não configurado', data: null }
  }
  
  try {
    const { data, error } = await supabase.from('escalas_funcionarios').select('count')
    return { data, error }
  } catch (err) {
    return { error: err, data: null }
  }
}