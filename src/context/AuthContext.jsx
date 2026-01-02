import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.warn("Auth not initialized. Proceeding as guest.");
            setLoading(false);
            return;
        }

        // Safety Timeout: If Firebase takes too long (e.g. 5s), proceed as guest
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("Auth initialization timed out. Proceeding as guest.");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            clearTimeout(timer);
        }, (error) => {
            console.error("Auth state error:", error);
            setLoading(false);
            clearTimeout(timer);
        });

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
