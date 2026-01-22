import getAPIResponseData from '../utils/api-response';

interface Invitee {
  email: string;
}

interface CreateInvitationResponse {
  token: string;
  projectId: string;
  expiresAt: string;
  invitees: Invitee[];
}

export const createInvitation = (projectId: string, emails: string[]) => {
  return getAPIResponseData<CreateInvitationResponse>({
    url: `/api/project/${projectId}/invitations`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
};

export const acceptInvitation = (projectId: string, token: string) => {
  return getAPIResponseData({
    url: `/api/project/${projectId}/members`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
};
