import fs from "fs";
import path from "path";

const treeFile = process.argv[2] || "tree.json";
const outRoot = process.argv[3] || "./src";
const force = process.argv.includes("--force");

const data = JSON.parse(fs.readFileSync(treeFile, "utf-8"));

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function toPropsInterfaceName(componentName) {
  return `${componentName}Props`;
}

function resolveOutPath(filePath) {
  const rel = filePath.startsWith("src/") ? filePath.slice(4) : filePath;
  return path.join(outRoot, rel);
}

function propsBlock(componentName, props) {
  if (!props || Object.keys(props).length === 0) {
    return { interfaceCode: "", propsParam: "" };
  }
  const ifaceName = toPropsInterfaceName(componentName);
  const fields = Object.entries(props)
    .map(([key, type]) => {
      const optional = typeof type === "string" && type.trim().endsWith("?");
      const cleanType = optional ? type.trim().slice(0, -1).trim() : type;
      return `  ${key}${optional ? "?" : ""}: ${cleanType};`;
    })
    .join("\n");
  const interfaceCode = `export interface ${ifaceName} {\n${fields}\n}\n\n`;
  return { interfaceCode, propsParam: `props: ${ifaceName}` };
}

function childImportLines(children, currentFileDir) {
  if (!children || children.length === 0) return "";
  return (
    children
      .map((child) => {
        const childOut = resolveOutPath(child.filePath);
        let rel = path.relative(currentFileDir, childOut);
        rel = rel.replace(/\.tsx$/, "");
        if (!rel.startsWith(".")) rel = "./" + rel;
        rel = rel.split(path.sep).join("/");
        return `import { ${child.name} } from "${rel}";`;
      })
      .join("\n") + "\n"
  );
}

function childRenderPlaceholders(children) {
  if (!children || children.length === 0) return "";
  return (
    "\n      {/* TODO: truyền props thật cho các component con bên dưới */}\n" +
    children.map((c) => `      {/* <${c.name} /> */}`).join("\n") +
    "\n"
  );
}

function generateFile(node) {
  const outPath = resolveOutPath(node.filePath);

  if (!force && fs.existsSync(outPath)) {
    console.log("⏭  Bỏ qua (đã tồn tại): " + outPath);
    return null;
  }

  ensureDir(outPath);

  const { interfaceCode, propsParam } = propsBlock(node.name, node.props);
  const currentFileDir = path.dirname(outPath);
  const imports = childImportLines(node.children, currentFileDir);
  const childrenComment = childRenderPlaceholders(node.children);

  const cssClassComment = node.cssClass
    ? ` * CSS gốc tham chiếu: .${String(node.cssClass).replace(/\s+/g, " ")}\n`
    : "";
  const domTagComment = node.domTag ? ` * Thẻ HTML gốc: <${node.domTag}>\n` : "";
  const descComment = node.description ? ` * Mô tả: ${node.description}\n` : "";

  const fnParams = propsParam ? `{ /* TODO: destructure props */ }: ${toPropsInterfaceName(node.name)}` : "";

  const content = `${imports}
/**
 * ${node.name}
${descComment}${domTagComment}${cssClassComment} */
${interfaceCode}export function ${node.name}(${fnParams ? `${fnParams}` : ""}) {
  return (
    <div className="${node.cssClass ? String(node.cssClass).split(" ")[0] : node.name.toLowerCase()}">
      {/* TODO: implement ${node.name} */}${childrenComment}
    </div>
  );
}
`;

  fs.writeFileSync(outPath, content, "utf-8");
  return outPath;
}

function walk(node, results) {
  if (node.filePath) {
    const res = generateFile(node);
    if (res) results.push(res);
  }
  if (node.children) {
    node.children.forEach((child) => walk(child, results));
  }
}

// ---- 1) Sinh design tokens CSS ----
if (data.designTokens) {
  const tokensPath = resolveOutPath(data.designTokens.filePath);
  if (!force && fs.existsSync(tokensPath)) {
    console.log("⏭  Bỏ qua (đã tồn tại): " + tokensPath);
  } else {
    ensureDir(tokensPath);
    const vars = Object.entries(data.designTokens.variables)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    fs.writeFileSync(tokensPath, `:root {\n${vars}\n}\n`, "utf-8");
    console.log("✔ " + tokensPath);
  }
}

// ---- 2) Sinh shared types ----
if (data.sharedTypesFile && data.sharedTypes) {
  const typesPath = resolveOutPath(data.sharedTypesFile);
  if (!force && fs.existsSync(typesPath)) {
    console.log("⏭  Bỏ qua (đã tồn tại): " + typesPath);
  } else {
    ensureDir(typesPath);
    const blocks = data.sharedTypes
      .map((t) => {
        if (t.kind === "type") {
          return `export type ${t.name} = ${t.definition};\n`;
        }
        const fields = Object.entries(t.fields)
          .map(([k, v]) => {
            const optional = typeof v === "string" && v.trim().endsWith("?");
            const cleanType = optional ? v.trim().slice(0, -1).trim() : v;
            return `  ${k}${optional ? "?" : ""}: ${cleanType};`;
          })
          .join("\n");
        return `export interface ${t.name} {\n${fields}\n}\n`;
      })
      .join("\n");
    fs.writeFileSync(typesPath, blocks, "utf-8");
    console.log("✔ " + typesPath);
  }
}

// ---- 3) Sinh shared components ----
const results = [];
if (data.sharedComponents) {
  data.sharedComponents.forEach((c) => {
    const p = generateFile(c);
    if (p) results.push(p);
  });
}

// ---- 4) Sinh cây component chính ----
if (data.tree) {
  walk(data.tree, results);
}
if (data.trees && Array.isArray(data.trees)) {
  data.trees.forEach((t) => walk(t, results));
}

console.log(`\nHoàn tất: đã tạo mới ${results.length} file (các file đã có được giữ nguyên).`);
