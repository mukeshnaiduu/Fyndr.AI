import { getApiUrl } from '../utils/api';

export async function fetchIndustries(query = '') {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    const qs = params.toString();
    const res = await fetch(getApiUrl(`/auth/industries/${qs ? `?${qs}` : ''}`));
    if (!res.ok) throw new Error('Failed to load industries');
    const data = await res.json();
    return data.results || [];
}
