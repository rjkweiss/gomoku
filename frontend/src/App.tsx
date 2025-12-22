import { Game } from './components/Game';
import './App.css';

function App() {

  return (
    <div className="app-container">
      <h1 className='app-title'>Gomoku</h1>
      <p className="app-subtitle">Get 5 in a row to win</p>
      <Game />
    </div>
  )
}

export default App
