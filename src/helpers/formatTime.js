
const formatTime = (time)=> {
    // Temps en minutes
    const minutes = Math.floor(time / 60);
    // Temps en secondes
    const secondes = Math.floor(time % 60);

    return `${minutes < 10 ? "0" : ""}${minutes} : ${secondes < 10 ? "0" : ""}${secondes}`
}

export default formatTime
