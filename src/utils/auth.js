const CLIENT_ID = "b5712a327f2e475a863e5b3560c6bbe9";
const REDIRECT_URI = "http://justkevin225.github.io/kevtunes/";

const authEndpoint = "https://accounts.spotify.com/authorize";
const responseType = "token";

export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: responseType,
    redirect_uri: REDIRECT_URI,
    scope: "user-read-playback-state,user-modify-playback-state,user-read-private,user-read-email,user-library-read",
  });

  return `${authEndpoint}?${params.toString()}`;
};

export const parseAuthToken = (hash) => {
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
};
export const parseRefreshToken = (hash) => {
  const params = new URLSearchParams(hash.slice(1));
  return params.get("refresh_token");
};
export const parseExpiresIn = (hash) => {
  const params = new URLSearchParams(hash.slice(1));
  const expiresInInSeconds = params.get("expires_in");
  return expiresInInSeconds ? expiresInInSeconds * 1000 : null; // Conversion en millisecondes
};



