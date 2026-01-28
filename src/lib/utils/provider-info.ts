export const getProviderInfo = (email?: string | null, image?: string | null) => {
  if (!email) return { name: '이메일', icon: 'E', color: '#000' };

  if (email.includes('gmail.com')) {
    return { name: 'Google', icon: 'G', color: '#4285F4' };
  }
  if (email.includes('naver.com')) {
    return { name: 'Naver', icon: 'N', color: '#03C75A' };
  }
  if (email.includes('github') || image?.includes('githubusercontent')) {
    return { name: 'GitHub', icon: 'G', color: '#333' };
  }
  
  return { name: '이메일', icon: 'E', color: '#888' };
};
