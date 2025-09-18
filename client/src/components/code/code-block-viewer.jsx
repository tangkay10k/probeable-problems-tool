import { Highlight, themes } from "prism-react-renderer";
import styles from "./codeBlockViewer.module.css";

export default function CodeBlockViewer({
  code,
  childComponents = null,
  customBackground = false,
  language = "cpp",
  theme = themes.vsDark,
}) {
  return (
    <Highlight code={code} language={language} theme={theme}>
      {({ style, tokens, getLineProps, getTokenProps }) => {
        const { background, backgroundColor, ...rest } = style;
        const preStyle = customBackground ? rest : style;

        return (
          <pre
            className={`${styles.block} ${customBackground ? styles.customBlock : ""}`}
            style={preStyle}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
            {childComponents}
          </pre>
        );
      }}
    </Highlight>
  );
}
