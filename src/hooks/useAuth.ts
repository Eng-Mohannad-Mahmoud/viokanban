import { useState, useEffect, useCallback } from 'react';
import { UserSession, DeviceRecord } from '../types';
import { detectDevice } from '../lib/device';
import {
  getSession,
  saveSession,
  clearSession,
  recordDeviceLogin,
  getDevices,
  getKnownUsers,
  seedInitialDataIfEmpty,
} from '../lib/storage';

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [knownUsers, setKnownUsers] = useState<string[]>([]);
  const [currentDeviceName, setCurrentDeviceName] = useState<string>('');

  // Initial load: check session & detect device
  useEffect(() => {
    const detected = detectDevice();
    setCurrentDeviceName(detected.friendlyName);

    const existingSession = getSession();
    if (existingSession && existingSession.email) {
      setSession(existingSession);
      const userDevices = getDevices(existingSession.email);
      setDevices(userDevices);
    }

    setKnownUsers(getKnownUsers());
    setLoading(false);
  }, []);

  // Login handler
  const login = useCallback((email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    const detected = detectDevice();
    const now = new Date().toISOString();

    // 1. Record device
    const updatedDevices = recordDeviceLogin(
      cleanEmail,
      detected.friendlyName,
      detected.browser,
      detected.os
    );

    // 2. Create session
    const newSession: UserSession = {
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      device: detected.friendlyName,
      lastLogin: now,
    };

    // 3. Save to localStorage
    saveSession(newSession);
    seedInitialDataIfEmpty(cleanEmail);

    // 4. Update React state
    setSession(newSession);
    setDevices(updatedDevices);
    setKnownUsers(getKnownUsers());

    return true;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setDevices([]);
  }, []);

  // Refresh devices list
  const refreshDevices = useCallback(() => {
    if (session?.email) {
      const userDevices = getDevices(session.email);
      setDevices(userDevices);
    }
  }, [session?.email]);

  return {
    session,
    isAuthenticated: !!session?.email,
    loading,
    devices,
    currentDeviceName,
    knownUsers,
    login,
    logout,
    refreshDevices,
  };
}
