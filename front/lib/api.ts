const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
    token?: string;
}

async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        ...(fetchOptions.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(fetchOptions.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
}

// --- Auth ---
export async function registerUser(username: string, email: string, password: string) {
    return apiFetch<{ user: any; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
}

export async function loginUser(email: string, password: string) {
    return apiFetch<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

// --- Trips ---
export async function getTrips(page = 1, limit = 20) {
    return apiFetch<{ trips: any[]; pagination: any }>(`/api/trips?page=${page}&limit=${limit}`);
}

export async function getTrip(id: string) {
    return apiFetch<any>(`/api/trips/${id}`);
}

export async function createTrip(
    data: { title: string; description: string; latitude: number; longitude: number },
    photos: File[],
    token: string
) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('latitude', String(data.latitude));
    formData.append('longitude', String(data.longitude));
    photos.forEach((photo) => formData.append('photos', photo));

    return apiFetch<any>('/api/trips', {
        method: 'POST',
        body: formData,
        token,
    });
}

export async function deleteTrip(id: string, token: string) {
    return apiFetch<{ message: string }>(`/api/trips/${id}`, {
        method: 'DELETE',
        token,
    });
}

// --- Markers ---
export async function getMarkers(bbox: { west: number; south: number; east: number; north: number }) {
    const bboxStr = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
    return apiFetch<any[]>(`/api/markers?bbox=${bboxStr}`);
}

// --- Messages ---
export async function getMessages(tripId: string, page = 1) {
    return apiFetch<any[]>(`/api/trips/${tripId}/messages?page=${page}`);
}

// --- Token helpers ---
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tidrod_token');
}

export function setToken(token: string): void {
    localStorage.setItem('tidrod_token', token);
}

export function removeToken(): void {
    localStorage.removeItem('tidrod_token');
}

export function getUser(): { id: string; email: string; username: string } | null {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: payload.id, email: payload.email, username: payload.username };
    } catch {
        return null;
    }
}
