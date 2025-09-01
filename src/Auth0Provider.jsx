import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "your-domain.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "your-client-id",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience:
      import.meta.env.VITE_AUTH0_AUDIENCE || "https://your-api-identifier",
      scope: "openid profile email",
  },
};

const Auth0ProviderWrapper = ({ children }) => {
  const onRedirectCallback = (appState) => {
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWrapper;
