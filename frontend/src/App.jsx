import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SearchScreen from './screens/SearchScreen'
import ProfileScreen from './screens/ProfileScreen'
import SimulationScreen from './screens/SimulationScreen'
import DecisionScreen from './screens/DecisionScreen'
import ReportScreen from './screens/ReportScreen'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SearchScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/simulation" element={<SimulationScreen />} />
          <Route path="/decision" element={<DecisionScreen />} />
          <Route path="/report" element={<ReportScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
