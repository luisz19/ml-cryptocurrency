// Buscar dados do usuário autenticado
export async function fetchUserProfile(token: string) {
	const res = await fetch(`${API_URL}/auth/me`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	if (!res.ok) throw new Error('Erro ao buscar perfil do usuário.');
	return await res.json(); // { id, name, email, risk_profile }
}
// Integração com backend FastAPI para login, registro e perfil de risco
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = 'http://localhost:8000';

export async function login(email: string, password: string) {
	const res = await fetch(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});
	if (!res.ok) throw new Error('Email ou senha inválidos.');
	return await res.json(); // { access_token }
}

export async function register(name: string, email: string, password: string) {
	const res = await fetch(`${API_URL}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password })
	});
	if (!res.ok) throw new Error('Erro ao registrar.');
	return await res.json(); // { access_token }
}

export async function updateUserProfile(
	token: string,
	updates: { name?: string; email?: string }
) {
	const body: Record<string, string> = {};
	if (typeof updates.name === 'string') body.name = updates.name;
	if (typeof updates.email === 'string') body.email = updates.email;

	const res = await fetch(`${API_URL}/auth/user/me`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error('Erro ao atualizar perfil.');
	return await res.json(); // { id, name, email, risk_profile }
}

export async function deleteUserAccount(token: string) {
	const res = await fetch(`${API_URL}/auth/user/me`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});
	if (!res.ok) throw new Error('Erro ao deletar conta.');
	return; // No content
}

export async function fetchQuestions(token: string) {
	const res = await fetch(`${API_URL}/questionnaire/questions`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	if (!res.ok) throw new Error('Erro ao buscar perguntas.');
	return await res.json(); // [{...}]
}

export async function fetchAnswers(token: string) {
	const res = await fetch(`${API_URL}/questionnaire/answers/`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	console.log('fetchAnswers response:', res);
	if (!res.ok) throw new Error('Erro ao buscar respostas.');
	return await res.json(); // [{...}]
}

export async function submitQuestionnaire(data: { answers: { question_id: number; selected_value: string }[] }, token: string) {
	const res = await fetch(`${API_URL}/questionnaire/submit`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error('Erro ao enviar respostas.');
    return await res.json(); // { risk_level, total_score }
}
