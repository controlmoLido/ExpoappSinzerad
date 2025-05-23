export const loginUser = async (nom: string, password: string, log: any) => {
  const isEmail = nom.includes('@');
  const body = isEmail ? { email: nom, password } : { username: nom, password };

  log.info(`Attempting login with ${isEmail ? 'email' : 'username'}`);

  const response = await fetch('http://127.0.0.1:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  log.info(`Response received: ${JSON.stringify(data)}`);

  if (!response.ok) {
    log.warn(`Login failed: ${data.error}`);
    throw new Error(data.error || 'Login failed');
  }

  log.success(`User authenticated: ${data.user.nom}`);
  return data.user;
};
