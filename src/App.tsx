import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import NowPlayingScreen from './screens/NowPlayingScreen'
import AlbumsScreen from './screens/AlbumsScreen'
import AlbumScreen from './screens/AlbumScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NowPlayingScreen />} />
        <Route path="/albums" element={<AlbumsScreen />} />
        <Route path="/album" element={<AlbumScreen />} />
        <Route path="/cd" element={<AlbumScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
