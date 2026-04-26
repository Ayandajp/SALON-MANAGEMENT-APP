export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-accent',
    'bg-success',
    'bg-avatar-purple',
    'bg-avatar-pink',
    'bg-avatar-amber',
    'bg-avatar-teal',
    'bg-avatar-blue',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
