export const getProviderInfo = (provider: string) => {
  if (!provider) return { name: '이메일', icon: 'E', color: '#000' };

  if (provider == 'google') {
    return { name: 'Google', icon: 'G', color: '#4285F4' };
  }
  if (provider == 'naver') {
    return { name: 'Naver', icon: 'N', color: '#03C75A' };
  }
  if (provider == 'github') {
    return { name: 'GitHub', icon: 'G', color: '#333' };
  }

  return { name: '이메일', icon: 'E', color: '#888' };
};
