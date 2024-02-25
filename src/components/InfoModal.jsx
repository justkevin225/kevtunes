/* eslint-disable react/no-unescaped-entities */
import { motion } from "framer-motion";

/* eslint-disable react/prop-types */
const InfoModal = ({ infoModalOn, setInfoModalOn }) => {
  return (
    infoModalOn === true && (
      <div
        onClick={() => {
          setInfoModalOn((v) => !v);
        }}
        className="z-10 w-screen h-screen flex items-center justify-center bg-white/15 backdrop-blur-sm text-white absolute"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[330px] bg-black rounded-md p-3"
        >
          <h1 className="flex items-center gap-2">
            <i className="fa-duotone fa-question-circle"></i>
            <span>Aide</span>
          </h1>
          <div style={{ textIndent: "2em" }} className="p-4">
            <p className="font-light text-sm">
              En tant qu'invité sur <b className="font-bold">Kevtunes</b>, vous
              avez la possibilité d'écouter une sélection limitée de pistes en
              entier. Vous pouvez accéder à cette sélection de pistes en
              naviguant dans le menu déroulant et en cliquant sur{" "}
              <span
                style={{ textIndent: "0" }}
                className="inline-flex gap-1 items-center cursor-pointer mb-2"
              >
                <i className="fa-duotone fa-music"></i>
                <span>Pistes</span>
              </span>
              .
            </p>
            <p className="font-light text-sm mt-3">
              Vous avez également la possibilité de vous connecter à votre
              compte{" "}
              <b
                style={{ textIndent: "0" }}
                className="text-green-600 inline-flex items-center gap-1"
              >
                Spotify <i className="fa-brands fa-spotify"></i>{" "}
              </b>{" "}
              afin d'accéder à toutes les pistes disponibles sur celle-ci.
              Cependant, veuillez noter que seules les pistes partielles seront
              accessibles, car un compte premium est requis pour écouter les
              pistes en entier.
            </p>
          </div>
          <hr className="border-gray-600 w-3/4 mx-auto" />
          <div className="text-xs text-center py-2">
            <i className="fa-duotone fa-code mx-1"></i> with{" "}
            <i className="fa-solid fa-heart mx-1"></i> by{" "}
            <a
              href="https://justkevin225.github.io/portfolio"
              className="font-bold"
              rel="noreferrer"
              target="_blank"
            >
              KEV
            </a>
          </div>
        </motion.div>
      </div>
    )
  );
};
export default InfoModal;
