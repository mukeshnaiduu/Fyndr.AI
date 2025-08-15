import { getApiUrl } from '../utils/api';

export async function fetchSkills(query = '') {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    const res = await fetch(getApiUrl(`/auth/skills/${params}`));
    if (!res.ok) throw new Error('Failed to load skills');
    const data = await res.json();
    return data.results || [];
}
