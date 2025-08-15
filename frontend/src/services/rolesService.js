import { getApiUrl } from '../utils/api';

export async function fetchRoles(query = '', audience) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (audience) params.set('audience', audience);
    const qs = params.toString();
    const res = await fetch(getApiUrl(`/auth/roles/${qs ? `?${qs}` : ''}`));
    if (!res.ok) throw new Error('Failed to load roles');
    const data = await res.json();
    return data.results || [];
}
