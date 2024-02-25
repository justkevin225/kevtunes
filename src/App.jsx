/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import _songs from "./data/songs.js";
import formatTime from "./helpers/formatTime.js";
import {
  getAuthorizationUrl,
  parseAuthToken,
  parseExpiresIn,
  parseRefreshToken,
} from "./utils/auth";
import InfoModal from "./components/InfoModal.jsx";
import TracksModal from "./components/TracksModal.jsx";

const App = () => {
  // Refs
  const audioRef = useRef();
  const rangeRef = useRef();

  // States
  const [index, setIndex] = useState(0);
  const [songs, setSongs] = useState(_songs);
  const [track, setTrack] = useState();
  const [currentSongSrc, setCurrentSongSrc] = useState(songs[0].src);
  const [currentSongCover, setCurrentSongCover] = useState(songs[0].cover);
  const [currentSongArtist, setCurrentSongArtist] = useState(songs[0].artist);
  const [currentSongTitle, setCurrentSongTitle] = useState(songs[0].title);
  const [playOrPause, setPlayOrPause] = useState(false);
  const [maxDuration, setMaxDuration] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [settingsOn, setSettingsOn] = useState(false);
  const [infoModalOn, setInfoModalOn] = useState(false);
  const [tracksModalOn, setTracksModalOn] = useState(false);

  const [endScale, setEndScale] = useState(1);
  const [startScale, setStartScale] = useState(1.1);

  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [searchResults, setSearchResults] = useState("");
  const [userData, setUserData] = useState();

  const [userDataLoading, setUserDataLoading] = useState(true);
  const [onQuery, setOnQuery] = useState(false);

  // handlers
  const selectTrack = (_track) => {
    setOnQuery(false);

    setTrack(null);
    setCurrentSongSrc(null);
    setCurrentSongTitle(null);
    setCurrentSongArtist(null);
    setCurrentSongCover(null);

    audioRef.current.addEventListener("loadedmetadata", () => {
      if (_track.cover) {
        setCurrentSongTitle(_track.title);
        setCurrentSongSrc(_track.src);
        setCurrentSongCover(_track.cover);
        setCurrentSongArtist(_track.artist);
        setMaxDuration(audioRef.current.duration);
      } else {
        setCurrentSongSrc(_track.preview_url);
        setCurrentSongTitle(_track.name);
        setCurrentSongArtist(_track.artists[0].name);
        setCurrentSongCover(_track.album.images[0].url);
        setMaxDuration(audioRef.current.duration);
      }
      audioRef.current.play();
      setPlayOrPause(true);
    });
    setTrack(_track);
  };

  const handleLogin = () => {
    window.location.href = getAuthorizationUrl();
  };
  console;
  const getUserInfos = async () => {
    try {
      setUserDataLoading(false);
      const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const _userData = await response.json();
        setUserDataLoading(true);
        setUserData(_userData); // userData contient les informations de l'utilisateur
      } else {
        console.error("Error getting user info:", response.statusText);
      }
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  // Fonction pour rafraîchir le jeton d'accès
  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: "b5712a327f2e475a863e5b3560c6bbe9",
          client_secret: "383c0baa6f7d4028b602adaa67ba4839",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // Stockez le nouveau jeton d'accès quelque part dans votre application
        const newAccessToken = data.access_token;
        localStorage.setItem("accessToken", newAccessToken);
      } else {
        console.error(
          "Erreur lors du rafraîchissement du jeton d'accès :",
          response.statusText
        );
        return null;
      }
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement du jeton d'accès :",
        error
      );
      return null;
    }
  };

  useEffect(() => {
    const tokenCheckInterval = setInterval(() => {
      // le jeton d'accès et l'heure d'expiration de votre application

      // Vérifier si le jeton d'accès est expiré
      if (
        Date.now() >=
        parseInt(localStorage.getItem("tokenCreatedOn")) +
          parseInt(localStorage.getItem("expiresIn"))
      ) {
        // Si le jeton d'accès est expiré, on le rafraîchis
        refreshAuthToken(localStorage.getItem("refreshToken"));
      }
    }, 10000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) return;
    getUserInfos();
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setSettingsOn(false);
    setUserData(null);
    setAuthToken(null);
  };

  const searchTracks = async (e) => {
    if (e.currentTarget.value.length < 2) {
      setOnQuery(false);
      return;
    }
    setOnQuery(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${e.currentTarget.value}&type=track`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      } else {
        console.error("Error searching tracks:", response.statusText);
      }
    } catch (error) {
      console.error("Error searching tracks:", error);
    }
  };

  const handleLoadedMetaData = () => {
    // Pour patcher un bug
    if (track) {
      try {
        setCurrentSongSrc(track.preview_url);
        setCurrentSongTitle(track.name);
        setCurrentSongArtist(track.artists[0].name);
        setCurrentSongCover(track.album.images[0].url);
      } catch (e) {
        setCurrentSongTitle(track.title);
        setCurrentSongSrc(track.src);
        setCurrentSongCover(track.cover);
        setCurrentSongArtist(track.artist);
      }
    } else {
      setCurrentSongTitle(songs[index].title);
      setCurrentSongSrc(songs[index].src);
      setCurrentSongCover(songs[index].cover);
      setCurrentSongArtist(songs[index].artist);
    }

    setMaxDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    setCurrentDuration(audioRef.current.currentTime);
    rangeRef.current.value = currentDuration;
    if (audioRef.current.duration === audioRef.current.currentTime) {
      handleNext();
    }
  };

  const handlePlayOrPause = () => {
    setPlayOrPause(!playOrPause);
  };

  const handlePrevNext = (newIndex) => {
    setTrack(null);
    setIndex(newIndex);
    setCurrentSongTitle(songs[newIndex].title);
    setCurrentSongSrc(songs[newIndex].src);
    setCurrentSongCover(songs[newIndex].cover);
    setCurrentSongArtist(songs[newIndex].artist);
    setPlayOrPause(true);
    setEndScale(1);
  };

  const handlePrev = () => {
    handlePrevNext(index === 0 ? songs.length - 1 : index - 1);
    setStartScale(1.2);
  };

  const handleNext = () => {
    handlePrevNext(index === songs.length - 1 ? 0 : index + 1);
    setStartScale(0.8);
  };

  const handleRangeChange = () => {
    setCurrentDuration(rangeRef.current.value);
    audioRef.current.currentTime = rangeRef.current.value;
  };

  useEffect(() => {
    if (!track) return;
    if (track.cover) {
      setCurrentSongTitle(track.title);
      setCurrentSongSrc(track.src);
      setCurrentSongCover(track.cover);
      setCurrentSongArtist(track.artist);
    } else {
      setCurrentSongSrc(track.preview_url);
      setCurrentSongTitle(track.name);
      setCurrentSongArtist(track.artists[0].name);
      setCurrentSongCover(track.album.images[0].url);
    }
  }, [track]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = parseAuthToken(hash);
      setAuthToken(token);
      localStorage.setItem("tokenCreatedOn", Date.now());
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", parseRefreshToken(hash));
      localStorage.setItem("expiresIn", parseExpiresIn(hash));
      window.history.pushState({}, null, "/kevtunes/");
    }
  }, []);

  useEffect(() => {
    if (playOrPause) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [playOrPause, currentSongSrc, track]);

  useEffect(() => {
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetaData);
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audioRef.current.removeEventListener(
        "loadedmetadata",
        handleLoadedMetaData
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [handleLoadedMetaData, handleTimeUpdate]);

  return (
    <div className="bg-black overflow-hidden select-none font-[Kanit]">
      <InfoModal infoModalOn={infoModalOn} setInfoModalOn={setInfoModalOn} />
      <TracksModal
        tracksModalOn={tracksModalOn}
        setTracksModalOn={setTracksModalOn}
        selectTrack={selectTrack}
      />
      <div className=" mx-auto h-screen lg:w-3/5 flex flex-col justify-between text-white">
        <header className="grow-0 flex justify-between items-center p-3">
          <div className="flex items-center relative">
            <img
              src="./images/mon logo - fond noir.png"
              alt="mon logo"
              className="w-16"
            />
            <span className="text-xl translate-y-2 -translate-x-3">
              evtunes
            </span>
            <i className="absolute text-xs fa-duotone fa-music bottom-1/2 -translate-y-[15%] right-1"></i>
          </div>
          <div className="flex items-center gap-2">
            {userData ? (
              <>
                <div className="w-8 h-8 flex items-center justify-center border-2 border-white rounded-full overflow-hidden">
                  {userData.images[0] ? (
                    <img
                      src={userData.images[0].url}
                      alt="user icon"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="uppercase font-bold">
                      {userData.display_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="relative">
                    <div
                      onClick={() => {
                        setSettingsOn((v) => !v);
                      }}
                      className="text-sm flex gap-2 items-center cursor-pointer"
                    >
                      <span>{userData.display_name}</span>
                      <i className="fa-solid fa-caret-down"></i>
                    </div>
                    <div
                      className={`${
                        settingsOn === false
                          ? "translate-y-full opacity-0 invisible"
                          : "translate-y-0 opacity-1 visible"
                      } transition-all duration-300 absolute top-full right-0 bg-neutral-800 p-3 rounded-md text-xs`}
                    >
                      <div
                        onClick={() => {
                          setTracksModalOn((v) => !v);
                          setSettingsOn(false);
                        }}
                        className="flex gap-2 items-center cursor-pointer mb-2"
                      >
                        <i className="fa-duotone fa-music"></i>
                        <span>Pistes</span>
                      </div>
                      <div
                        onClick={() => {
                          setInfoModalOn((v) => !v);
                          setSettingsOn(false);
                        }}
                        className="flex gap-2 items-center cursor-pointer"
                      >
                        <i className="fa-duotone fa-circle-question"></i>
                        <span>Aide</span>
                      </div>
                      <hr className="border-gray-500 my-2" />
                      <div
                        onClick={handleLogout}
                        className="flex gap-2 items-center cursor-pointer hover:text-red-600 duration-300 transition-all"
                      >
                        <i className="fa-duotone fa-person-from-portal"></i>
                        <span>Déconnexion</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-500 flex gap-2 items-center">
                    <i className="fa-solid fa-circle text-[8px] animate-pulse"></i>
                    <span className="text-xs">Connecté</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {userDataLoading === false ? (
                  <div className="flex items-center justify-center bg-red w-44">
                    <i className="fa-duotone fa-spin fa-spinner-third"></i>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      onClick={() => {
                        setSettingsOn((v) => !v);
                      }}
                      className="flex gap-2 items-center cursor-pointer"
                    >
                      <i className="fa-duotone fa-user-tie-hair"></i>
                      <span>invité</span>
                      <i className="fa-solid fa-caret-down"></i>
                    </div>
                    <div
                      className={`${
                        settingsOn === false
                          ? "translate-y-full opacity-0 invisible"
                          : "translate-y-0 opacity-1 visible"
                      } transition-all duration-300 absolute top-full right-0 bg-neutral-800 p-3 rounded-md text-xs`}
                    >
                      <div
                        onClick={() => {
                          setTracksModalOn((v) => !v);
                          setSettingsOn(false);
                        }}
                        className="flex gap-2 items-center cursor-pointer mb-2"
                      >
                        <i className="fa-duotone fa-music"></i>
                        <span>Pistes</span>
                      </div>
                      <div
                        onClick={() => {
                          setInfoModalOn((v) => !v);
                          setSettingsOn((v) => !v);
                        }}
                        className="flex gap-2 items-center cursor-pointer"
                      >
                        <i className="fa-duotone fa-circle-question"></i>
                        <span>Aide</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </header>
        <main
          onClick={() => {
            setSettingsOn(false);
            setInfoModalOn(false);
            setTracksModalOn(false);
            setOnQuery(false);
          }}
          className="grow flex items-center justify-center overflow-auto "
        >
          <div className="w-[310px] h-[340px] bg-neutral-800 relative shadow-xl rounded-lg p-5">
            <audio ref={audioRef} preload="auto" src={currentSongSrc}></audio>

            {/* Cover */}
            <motion.img
              src={currentSongCover}
              alt={currentSongTitle}
              key={currentSongTitle}
              initial={{ opacity: 0, scale: startScale }}
              animate={{ opacity: 1, scale: endScale }}
              transition={{ duration: 0.5 }}
              className="w-[220px] origin-center rounded-lg absolute -left-5 -top-5 shadow-3xl"
            />
            {/* infos */}
            <div className="flex flex-col absolute left-5 bottom-16">
              <h2 className="font-bold">{currentSongArtist}</h2>
              <h3 className="">{currentSongTitle}</h3>
            </div>
            {/* Range Bar */}
            <input
              type="range"
              ref={rangeRef}
              max={maxDuration}
              value={currentDuration}
              onChange={handleRangeChange}
              className="w-[270px] absolute left-1/2 -translate-x-1/2 bottom-9 cursor-pointer"
            />
            {/* times */}
            <div className="font- absolute flex justify-between w-[270px] left-1/2 -translate-x-1/2 bottom-4 text-xs">
              <span>{formatTime(currentDuration)}</span>
              <span>{formatTime(maxDuration)}</span>
            </div>

            {/* btns */}
            <div className="flex flex-col absolute right-7 top-24 gap-2">
              <button
                className="px-2 py-2 text-white text-2xl outline-none inline-block w-[50px] h-[50px] hover:bg-neutral-600 rounded-full transition-all duration-300 hover:shadow-lg"
                onClick={handlePrev}
              >
                <i className="fa-duotone fa-backward"></i>
              </button>
              <button
                className="px-2 py-2 text-white text-2xl outline-none inline-block w-[50px] h-[50px] hover:bg-neutral-600 rounded-full transition-all duration-300 hover:shadow-lg"
                onClick={handleNext}
              >
                <i className="fa-duotone fa-forward"></i>
              </button>
            </div>
            <button
              className="rounded-full duration-300 transition-all hover:shadow-xl absolute right-5 top-5  w-16 h-16 flex items-center justify-center border-8 border-white px-2 py-2 text-white text-3xl outline-none"
              onClick={handlePlayOrPause}
            >
              {!playOrPause ? (
                <i className="fa-solid fa-play"></i>
              ) : (
                <i className="fa-solid fa-pause"></i>
              )}
            </button>
          </div>
        </main>
        {!authToken ? (
          <div className="grow-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              onClick={handleLogin}
              className="cursor-pointer flex items-center my-3 transition-all duration-300 hover:bg-green-900 active:scale-90 bg-green-600 gap-2 text-white w-fit py-2 px-4 rounded-md"
            >
              <span>Connectez-vous avec Spotify</span>
              <i className="fa-brands fa-spotify"></i>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="grow-0 px-3 py-2 relative origin-center text-white w-full sm:w-3/5 sm:mx-auto"
          >
            <input
              onChange={searchTracks}
              placeholder="Recherchez vos pistes ou des artistes..."
              className="transition-all duration-300 focus:border-white text-white bg-inherit w-full py-2 px-4 rounded-md outline-none border border-gray-600"
            />
            <i className="fa-solid fa-search absolute right-6 top-1/2 -translate-y-1/2"></i>

            <div
              className={`${
                onQuery === false
                  ? "-translate-y-[200] opacity-0 invisible"
                  : "-translate-y-full opacity-1 visible"
              } transition-all h-[250px] w-5/6 sm:w-full overflow-auto duration-300 absolute top-0 right-0 bg-black/50 border border-white backdrop-blur-sm p-3 rounded-md text-xs`}
            >
              {searchResults ? (
                <div className="flex flex-col gap-2">
                  {searchResults.map((_track, i) => (
                    <div
                      className="cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-white hover:text-black"
                      onClick={() => selectTrack(_track)}
                      key={i}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="w-12 h-12 overflow-hidden rounded-md">
                          <img
                            src={_track.album.images[2].url}
                            alt={_track.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                          <div className="font-semibold">{_track.name}</div>
                          <div>{_track.artists[0].name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>Aucun résultat !</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default App;
