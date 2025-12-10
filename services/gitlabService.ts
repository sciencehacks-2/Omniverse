import { GitLabConfig, GitLabFileResponse } from '../types';

const API_BASE = 'https://gitlab.com/api/v4';

export const fetchFileContent = async (config: GitLabConfig): Promise<string> => {
  if (!config.personalAccessToken || !config.projectId || !config.filePath) {
    throw new Error('Missing GitLab configuration');
  }

  const encodedPath = encodeURIComponent(config.filePath);
  const url = `${API_BASE}/projects/${config.projectId}/repository/files/${encodedPath}?ref=${config.branch}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'PRIVATE-TOKEN': config.personalAccessToken,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return ''; // File doesn't exist yet, which is fine
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GitLab API Error: ${response.status} ${errorData.message || response.statusText}`);
  }

  const data: GitLabFileResponse = await response.json();
  // GitLab returns content base64 encoded
  try {
    return atob(data.content);
  } catch (e) {
    console.error("Failed to decode base64", e);
    return data.content; 
  }
};

export const updateFileContent = async (config: GitLabConfig, content: string, commitMessage: string): Promise<void> => {
  if (!config.personalAccessToken || !config.projectId || !config.filePath) {
    throw new Error('Missing GitLab configuration');
  }

  const encodedPath = encodeURIComponent(config.filePath);
  const url = `${API_BASE}/projects/${config.projectId}/repository/files/${encodedPath}`;

  // content must be base64 encoded for safety (avoiding JSON escaping issues)
  // btoa handles basic strings, for utf-8 specific, a buffer approach is better but btoa is sufficient for simple JSON.
  // We'll trust standard btoa for this demo.
  // NOTE: GitLab requires text content in the payload for commit actions.
  
  const payload = {
    branch: config.branch,
    content: content,
    commit_message: commitMessage,
  };

  // Check if file exists first to decide between POST (create) and PUT (update)
  // For simplicity, we assume the user might need to Create it if it fails, or we just try PUT first.
  // Actually, correct flow: Try GET. If 404, use POST. If 200, use PUT.
  
  const checkResponse = await fetch(`${url}?ref=${config.branch}`, {
    method: 'HEAD',
    headers: { 'PRIVATE-TOKEN': config.personalAccessToken }
  });

  const method = checkResponse.status === 404 ? 'POST' : 'PUT';

  const response = await fetch(url, {
    method: method,
    headers: {
      'PRIVATE-TOKEN': config.personalAccessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to update file: ${response.status} ${errorData.message || response.statusText}`);
  }
};
