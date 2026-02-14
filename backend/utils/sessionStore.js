const sessions = {};

export function createSession(role) {
  const sessionId = Date.now().toString();

  sessions[sessionId] = {
    role,
    difficulty: "medium",
    history: [],
  };

  return sessionId;
}

export function getSession(sessionId) {
  return sessions[sessionId];
}

export function updateSession(sessionId, data) {
  sessions[sessionId] = {
    ...sessions[sessionId],
    ...data,
  };
}
