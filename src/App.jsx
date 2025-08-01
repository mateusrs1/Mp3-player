import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeOff,
  FaStepBackward,
  FaStepForward,
  FaFolderOpen
} from "react-icons/fa";
import "./App.css";

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackFiles, setTrackFiles] = useState([]);
  const [playlistUrls, setPlaylistUrls] = useState([]);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const getTrackName = (file, maxLength = 30) => {
    if (!file) return "No track loaded";
    const name = file.name.replace(/\.mp3$/, "");
    return name.length > maxLength ? name.slice(0, maxLength) + "…" : name;
  };

  useEffect(() => {
    const trackName = getTrackName(trackFiles[currentTrackIndex]);
    document.title = isPlaying ? ` ${trackName}` : ` ${trackName}`;
  }, [currentTrackIndex, isPlaying, trackFiles]);

  useEffect(() => {
    if (audioRef.current && playlistUrls.length > 0) {
      audioRef.current.src = playlistUrls[currentTrackIndex];
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, playlistUrls]);

  useEffect(() => {
    if (audioRef.current && playlistUrls.length > 0) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playlistUrls]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTogglePlay = () => {
    if (playlistUrls.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      const newProgress =
        (currentAudio.currentTime / currentAudio.duration) * 100;
      setProgress(newProgress);
    }
  };

  const handleSongEnded = () => {
    if (playlistUrls.length > 0) {
      const nextTrackIndex = (currentTrackIndex + 1) % playlistUrls.length;
      setCurrentTrackIndex(nextTrackIndex);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      const seekTime = (e.target.value / 100) * currentAudio.duration;
      currentAudio.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePreviousTrack = () => {
    if (playlistUrls.length > 0) {
      const prevTrackIndex =
        (currentTrackIndex - 1 + playlistUrls.length) % playlistUrls.length;
      setCurrentTrackIndex(prevTrackIndex);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (playlistUrls.length > 0) {
      const nextTrackIndex = (currentTrackIndex + 1) % playlistUrls.length;
      setCurrentTrackIndex(nextTrackIndex);
      setIsPlaying(true);
    }
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("audio/")
    );
    const newPlaylistUrls = files.map((file) => URL.createObjectURL(file));

    if (playlistUrls.length > 0) {
      playlistUrls.forEach((url) => URL.revokeObjectURL(url));
    }

    setTrackFiles(files);
    setPlaylistUrls(newPlaylistUrls);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="content-body">
      <div className="track-list-container">
        <h2 className="track-list-title">Track List</h2>
        <ul className="track-list">
          {trackFiles.map((file, index) => (
            <li
              key={index}
              className={`track-item ${currentTrackIndex === index ? "active" : ""
                }`}
              onClick={() => {
                setCurrentTrackIndex(index);
                setIsPlaying(true);
              }}
            >
              {getTrackName(file)}
            </li>
          ))}
        </ul>
      </div>
      <div className="player-body">
        <div className="player-card">
          <h1 className="player-title">Audio Player</h1>
          <p className="track-info">
            Now Playing: {getTrackName(trackFiles[currentTrackIndex])}
          </p>

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleSongEnded}
            onLoadedMetadata={() =>
              setDuration(audioRef.current.duration)
            }
          />

          <input
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            ref={fileInputRef}
            onChange={handleFolderSelect}
            className="hidden-file-input"
          />

          <div className="load-folder-container">
            <button onClick={triggerFileInput} className="load-folder-btn">
              <FaFolderOpen className="load-folder-icon" /> Load Folder
            </button>
          </div>

          <div className="controls-container">
            <button onClick={handlePreviousTrack} className="track-control-btn">
              <FaStepBackward className="control-icon" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="play-pause-btn"
              disabled={playlistUrls.length === 0}
            >
              {isPlaying ? (
                <FaPause className="play-pause-icon" />
              ) : (
                <FaPlay className="play-pause-icon play-icon-adjust" />
              )}
            </button>
            <button onClick={handleNextTrack} className="track-control-btn">
              <FaStepForward className="control-icon" />
            </button>
          </div>

          <div className="progress-container">
            <span className="time-display">
              {formatTime(audioRef.current?.currentTime)}
            </span>
            <div className="progress-bar-wrapper">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="progress-bar"
                disabled={playlistUrls.length === 0}
              />
            </div>
            <span className="time-display">{formatTime(duration)}</span>
          </div>

          <div className="volume-container">
            <div className="volume-icon-wrapper">
              {volume > 0 ? <FaVolumeUp /> : <FaVolumeOff />}
            </div>
            <div className="volume-bar-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-bar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
