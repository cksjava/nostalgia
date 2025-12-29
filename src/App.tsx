import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import NowPlayingScreen from './screens/NowPlayingScreen'
import AlbumsScreen from './screens/AlbumsScreen'
import AlbumScreen from './screens/AlbumScreen'
import CdAudioScreen from './screens/CdAudioScreen'
import PlaylistsScreen from './screens/PlaylistsScreen'
import FavouritesScreen from './screens/FavouritesScreen'
import SettingsScreen from './screens/SettingsScreen'
import PlaylistDetailsScreen from './screens/PlaylistDetailsScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AlbumsScreen />} />
        <Route path="/albums" element={<AlbumsScreen />} />
        <Route path="/now-playing/:trackId" element={<NowPlayingScreen />} />
        <Route path="/album" element={<AlbumScreen />} />
        <Route path="/cd" element={<CdAudioScreen />} />
        <Route path="/playlists" element={<PlaylistsScreen />} />
        <Route path="/playlists/:id" element={<PlaylistDetailsScreen />} />
        <Route path="/favourites" element={<FavouritesScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
