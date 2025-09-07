import { Highlight, themes } from "prism-react-renderer";
import styles from "./codeBlockViewer.module.css";

export default function CodeBlockViewer({ code, childComponents = null }) {
  // NOTE: Library doesn't support c, so we hard code CPP for now.
  return (
    <Highlight code={code} language="cpp" theme={themes.vsDark}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre className={styles.block} style={{ ...style }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
          {childComponents ?? childComponents}
        </pre>
      )}
    </Highlight>
  );
}
