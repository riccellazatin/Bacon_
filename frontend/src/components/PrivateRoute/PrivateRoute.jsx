import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const auth = useSelector((state) => state.auth);
  const token = auth.token;
  const isOnboarded = auth.isOnboarded;
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to the preferences screen even if not onboarded
  const isPreferencesRoute = location.pathname === '/preferences';
  // If we have a token but the current user data isn't loaded yet, wait
  // - while loading: render nothing (avoid redirect flicker)
  // - if fetch errored: send to login
  if (token && !auth.userInfo) {
    if (auth.loading) return null;
    if (auth.error) return <Navigate to="/login" replace />;
    // not loading and no userInfo yet — allow a brief wait instead of redirect
    return null;
  }

  // Only enforce onboarding redirect once we have user info
  if (token && auth.userInfo && !isOnboarded && !isPreferencesRoute) {
    return <Navigate to="/preferences" replace />;
  }

  return children;
}
