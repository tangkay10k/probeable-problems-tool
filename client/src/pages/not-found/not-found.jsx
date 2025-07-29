import styles from "./error.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1>404 NOT FOUND</h1>
      <a
        href={
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&ab_channel=RickAstley"
        }
      >
        Why are you here?
      </a>
    </div>
  );
}
