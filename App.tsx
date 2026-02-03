
import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import MatchScreen from './components/MatchScreen';
import LoginScreen from './components/LoginScreen';
import { MatchSettings, MatchState, CompletedMatch } from './types';
import { createInitialMatchState } from './logic';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'match'>('setup');
  const [matchSettings, setMatchSettings] = useState<MatchSettings | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [history, setHistory] = useState<CompletedMatch[]>([]);
  const [authUser, setAuthUser] = useState<{ username: string; displayName: string } | null>(null);
  const [users, setUsers] = useState<{ username: string; password: string; displayName: string }[]>([]);

  const AUTH_KEY = 'cocopick_auth_user';
  const USERS_KEY = 'cocopick_users';

  const defaultUsers = Array.from({ length: 20 }, (_, i) => {
    const id = String(i + 1).padStart(3, '0');
    return {
      username: `COCOPICK-${id}`,
      password: String(812345 + i * 37).padStart(6, '0'),
      displayName: `COCO PICK ${id}`,
      deviceId: null as string | null
    };
  });

  const DEVICE_KEY = 'cocopick_device_id';
  const getDeviceId = () => {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const newId = `dev-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
    localStorage.setItem(DEVICE_KEY, newId);
    return newId;
  };

  const loadUsers = () => {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((u: any) => ({
          ...u,
          deviceId: u.deviceId ?? null
        }));
      } catch {
        // fallthrough
      }
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) {
      const found = loadedUsers.find((u: any) => u.username === savedUser);
      const deviceId = getDeviceId();
      if (found && (!found.deviceId || found.deviceId === deviceId)) {
        setAuthUser({ username: found.username, displayName: found.displayName });
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    }

    const savedHistory = localStorage.getItem('pickleball_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleStartMatch = (settings: MatchSettings) => {
    setMatchSettings(settings);
    setMatchState(createInitialMatchState(settings.initialServerTeam));
    setCurrentView('match');
  };

  const handleExitMatch = () => {
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pickleball_history');
  };

  const handleLogin = (username: string, password: string) => {
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return 'Sai tài khoản hoặc mật khẩu.';

    const deviceId = getDeviceId();
    if (found.deviceId && found.deviceId !== deviceId) {
      return 'Tài khoản này đã được đăng nhập trên thiết bị khác.';
    }

    const updated = users.map(u => {
      if (u.username !== found.username) return u;
      return { ...u, deviceId };
    });
    setUsers(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.setItem(AUTH_KEY, found.username);
    setAuthUser({ username: found.username, displayName: found.displayName });
    return null;
  };

  const handleUpdateProfile = (username: string, displayName: string, password?: string) => {
    const updated = users.map(u => {
      if (u.username !== username) return u;
      return {
        ...u,
        displayName,
        password: password && password.length > 0 ? password : u.password
      };
    });
    setUsers(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    setAuthUser({ username, displayName });
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthUser(null);
    setCurrentView('setup');
  };

  const handleFinishMatch = (match: CompletedMatch) => {
    const newHistory = [match, ...history];
    setHistory(newHistory);
    localStorage.setItem('pickleball_history', JSON.stringify(newHistory));
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
  };

  if (!authUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="font-sans antialiased text-white bg-slate-950 min-h-screen">
      {currentView === 'setup' ? (
        <SetupScreen
          onStart={handleStartMatch}
          history={history}
          onClearHistory={handleClearHistory}
          authUser={authUser}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      ) : (
        matchSettings && matchState && (
          <MatchScreen 
            settings={matchSettings} 
            state={matchState} 
            setState={setMatchState}
            onExit={handleExitMatch}
            onFinish={handleFinishMatch}
          />
        )
      )}
    </div>
  );
};

export default App;
