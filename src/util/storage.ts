function prefix(key: string) {
  return `__cra11y_${key}`;
}

export function get(key: string): string {
  return JSON.parse(window.localStorage.getItem(prefix(key)) || '{}');
}

export function store(key: string, data: any) {
  window.localStorage.setItem(prefix(key), JSON.stringify(data));
}
