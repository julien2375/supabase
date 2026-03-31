import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import BacklogPage from './components/backlog/BacklogPage'
import TechniciensPage from './components/techniciens/TechniciensPage'
import MachinesPage from './components/machines/MachinesPage'
import PlanningPage from './components/planning/PlanningPage'
import ComposerPage from './components/composer/ComposerPage'

export default function App() {
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
