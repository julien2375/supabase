import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabaseConfigured } from './lib/supabase'
import Layout from './components/layout/Layout'
import BacklogPage from './components/backlog/BacklogPage'
import TechniciensPage from './components/techniciens/TechniciensPage'
import MachinesPage from './components/machines/MachinesPage'
import PlanningPage from './components/planning/PlanningPage'
import ComposerPage from './components/composer/ComposerPage'

function ConfigError() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#1A1D23]">
      <div className="bg-[#22262E] border border-[#353B47] rounded-xl p-8 max-w-lg text-center">
        <h1 className="text-xl font-bold text-white mb-3">
          Plan<span className="text-[#3B82F6]">OT</span>
        </h1>
        <p className="text-[#EF4444] font-medium mb-2">Configuration Supabase manquante</p>
        <p className="text-gray-400 text-sm mb-4">
          Les variables d'environnement <code className="text-white bg-[#2A2F38] px-1.5 py-0.5 rounded font-mono text-xs">VITE_SUPABASE_URL</code> et{' '}
          <code className="text-white bg-[#2A2F38] px-1.5 py-0.5 rounded font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> ne sont pas définies.
        </p>
        <div className="text-left bg-[#1A1D23] rounded-lg p-4 text-xs font-mono text-gray-300">
          <p className="text-gray-500 mb-1"># Dans Vercel : Settings &gt; Environment Variables</p>
          <p>VITE_SUPABASE_URL=https://votre-projet.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=votre-clé-anon</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  if (!supabaseConfigured) {
    return <ConfigError />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/backlog" replace />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/techniciens" element={<TechniciensPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/composer" element={<ComposerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
