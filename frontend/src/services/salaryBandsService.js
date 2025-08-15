import { getApiUrl } from '../utils/api';

export async function fetchSalaryBands(currency = 'INR') {
    const params = new URLSearchParams();
    if (currency) params.set('currency', currency);
    const qs = params.toString();
    const res = await fetch(getApiUrl(`/auth/salary-bands/${qs ? `?${qs}` : ''}`));
    if (!res.ok) throw new Error('Failed to load salary bands');
    const data = await res.json();
    return data.results || [];
}
