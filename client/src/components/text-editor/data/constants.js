export const LANGUAGE_VERSIONS = {
    // Default languages for PISTON API, gets updated dynamically at runtime.
    c: "10.2.0",
    java: "15.0.2",
    python: "3.10.0",
    javascript: "18.15.0",
    typescript: "5.0.3",
    csharp: "6.12.0",
}

export const LANGUAGE_DISPLAY_NAMES = {
    // What gets displayed in the text editor to the user.
    c: "C",
    java: "Java",
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",

    csharp: "C#",
}

export const CODE_SNIPPETS = {
    javascript: `function greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    typescript: `type Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
    python: `def greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    csharp:
        'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World\\n");\n\treturn 0;\n}\n'
}

export const PISTON_TO_BACKEND = {
    java: "JAVA",
    c: "C"
}