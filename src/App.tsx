import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import NowPlayingScreen from './screens/NowPlayingScreen'
import AlbumsScreen from './screens/AlbumsScreen'
import AlbumScreen from './screens/AlbumScreen'
import CdAudioScreen from './screens/CdAudioScreen'
import PlaylistsScreen from './screens/PlaylistsScreen'
import PlaylistTracksScreen from './screens/PlaylistTracksScreen'
import FavouritesScreen from './screens/FavouritesScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NowPlayingScreen />} />
        <Route path="/albums" element={<AlbumsScreen />} />
        <Route path="/album" element={<AlbumScreen />} />
        <Route path="/cd" element={<CdAudioScreen />} />
        <Route path="/playlists" element={<PlaylistsScreen />} />
        <Route path="/playlists/:playlistId" element={<PlaylistTracksScreen />} />
        <Route path="/favourites" element={<FavouritesScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
