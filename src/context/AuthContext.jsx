import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error('Failed to verify token', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (name, email, password, role, logoFile = null) => {
        let res;

        if (logoFile) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);
            formData.append('logo', logoFile);

            res = await api.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } else {
            res = await api.post('/auth/register', { name, email, password, role });
        }

        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const uploadCv = async (cvFile) => {
        const formData = new FormData();
        formData.append('cv', cvFile);

        const res = await api.put('/auth/cv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Update user state with new cv_url
        setUser(prev => ({ ...prev, cv_url: res.data.cv_url }));
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, uploadCv }}>
            {children}
        </AuthContext.Provider>
    );
};
