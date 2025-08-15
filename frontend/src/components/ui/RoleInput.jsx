import React, { useEffect, useRef, useState } from 'react';
import Input from './Input';
import Icon from 'components/AppIcon';
import { fetchRoles } from 'services/rolesService';

// onChange receives plain string; onSelect is called when a suggestion is chosen.
export default function RoleInput({ label = 'Desired Job Title', name = 'role', value, onChange, onSelect, clearOnSelect = false, placeholder = 'e.g., Frontend Developer, Data Scientist', description, error, className, audience }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const q = (value || '').trim();
                if (!q) {
                    setSuggestions([]);
                    setOpen(false);
                    return;
                }
                const results = await fetchRoles(q, audience);
                if (!cancelled) {
                    const next = results.map(r => r.title).slice(0, 8);
                    setSuggestions(next);
                    setOpen(next.length > 0);
                }
            } catch (e) {
                if (!cancelled) {
                    setSuggestions([]);
                    setOpen(false);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [value]);

    useEffect(() => {
        const onDocMouseDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    const handleInputChange = (e) => {
        const next = e?.target?.value ?? '';
        onChange?.(next);
        setOpen(!!next);
    };

    const handleSelect = (opt) => {
        onChange?.(opt);
        onSelect?.(opt);
        if (clearOnSelect) onChange?.('');
        setOpen(false);
        setSuggestions([]);
    };

    return (
        <div ref={containerRef} className={`relative ${className || ''}`}>
            <Input
                label={label}
                name={name}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
                error={error}
                placeholder={placeholder}
                description={description}
            />
            {open && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-background backdrop-blur-sm border border-border rounded-lg max-h-60 overflow-y-auto shadow-lg ring-1 ring-black/5">
                    {suggestions.map((opt, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                        >
                            <Icon name="Briefcase" size={14} className="text-muted-foreground" />
                            <span>{opt}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
