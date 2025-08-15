import { getApiUrl } from '../utils/api';

export async function fetchLocations(query = '') {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    const res = await fetch(getApiUrl(`/auth/locations/${params}`));
    if (!res.ok) throw new Error('Failed to load locations');
    const data = await res.json();
    return data.results || [];
}
