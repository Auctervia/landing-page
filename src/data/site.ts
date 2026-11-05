// placeholder: true — replace url and email with the real ones before launch.
export const site = {
  name: 'Auctervia',
  url: 'https://auctervia.com',
  email: 'hello@auctervia.com',
  title: 'Auctervia: proof for every action your agents take',
  description:
    'Auctervia sits between your AI agents and their tools, checks every action against your policy before it runs, and keeps proof anyone can verify.',
};

export const mailto = `mailto:${site.email}?subject=${encodeURIComponent('Auctervia pilot')}`;
