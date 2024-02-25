/* eslint-disable react/no-unescaped-entities */
import { motion } from "framer-motion";
import songs from "../data/songs";

/* eslint-disable react/prop-types */
const TracksModal = ({ tracksModalOn, setTracksModalOn, selectTrack }) => {
  return (
    tracksModalOn === true && (
      <div
        onClick={() => {
          setTracksModalOn((v) => !v);
        }}
        className="z-10 w-screen h-screen flex items-center justify-center bg-white/15 backdrop-blur-sm text-white absolute"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[330px] h-[450px] overflow-auto bg-black rounded-md p-3"
        >
          <h1 className="flex items-center gap-2">
            <i className="fa-duotone fa-list-music"></i>
            <span>Pistes complètes</span>
          </h1>{" "}
          {songs.map((song, i) => (
            <div
              className="cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-white hover:text-black"
              onClick={() => {
                selectTrack(song);
              }}
              key={i}
            >
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 overflow-hidden rounded-md">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <div className="font-semibold text-sm">{song.title}</div>
                  <div className="text-xs font-light">{song.artist}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    )
  );
};
export default TracksModal;
