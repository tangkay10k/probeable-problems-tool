const development = import.meta.env.DEV; // true in dev, false in prod build

export default function isDev() {
  return development;
}
