import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';

// Helper to attach token and optional cache-bust
const withToken = (url, bust = false) => {
    if (!url) return '';
    const token = localStorage.getItem('accessToken') || '';
    let u = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
    if (bust) u += `&t=${Date.now()}`;
    return u;
};

const NavbarAvatar = ({ className = 'w-8 h-8 rounded-full object-cover' }) => {
    const [avatarUrl, setAvatarUrl] = useState('');

    const refreshFromLocalStorage = (bust = false) => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return setAvatarUrl('');
            const user = JSON.parse(userStr);
            const raw = user?.profile_image_url || user?.avatar || '';
            setAvatarUrl(withToken(raw, bust));
        } catch {
            setAvatarUrl('');
        }
    };

    useEffect(() => {
        refreshFromLocalStorage(false);
        const onStorage = (e) => {
            if (e.key === 'user' && e.newValue) {
                refreshFromLocalStorage(true);
            }
        };
        const onAvatarUpdated = () => {
            refreshFromLocalStorage(true);
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('avatar-updated', onAvatarUpdated);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('avatar-updated', onAvatarUpdated);
        };
    }, []);

    if (!avatarUrl) {
        return (
            <div className={`bg-muted flex items-center justify-center rounded-full ${className}`}>
                <Icon name="User" size={18} className="text-muted-foreground" />
            </div>
        );
    }
    return (
        <img
            src={avatarUrl}
            alt="User avatar"
            className={className}
            onError={() => setAvatarUrl('')}
        />
    );
};

export default NavbarAvatar;
