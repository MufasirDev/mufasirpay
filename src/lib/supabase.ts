import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL is missing from .env'
  )
}

if (!supabaseKey) {
  throw new Error(
    'VITE_SUPABASE_KEY is missing from .env'
  )
}

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )