// This file works as a modification to prism.js
let _ = Prism;

/**
 * A modification to Prism.highlight().
 * Converts the given token or token stream to an HTML representation with a theme specified.
 *
 * The following hooks will be run:
 * 1. `wrap`: On each {@link Token}.
 *
 * @param {string | Token | TokenStream} o The token or token stream to be converted.
 * @param {string} language The name of current language.
 * @param {object} theme The theme used to highlight, which looks like 
 *     DEFAULT_THEMES["light"] or so defined in themes.js. 
 * @returns {string} The HTML representation of the token or token stream.
 */
export function highlight(text, grammar, language, theme) {
  var env = {
    code: text,
    grammar: grammar,
    language: language
  };
  // _.hooks.run('before-tokenize', env);
  if (!env.grammar) {
    throw new Error('The language "' + env.language + '" has no grammar.');
  }
  env.tokens = _.tokenize(env.code, env.grammar);
  // _.hooks.run('after-tokenize', env);
  // return Token.stringify(_.util.encode(env.tokens), env.language);
  return stringifyTokensWithTheme(_.util.encode(env.tokens), env.language, theme);
}

/**
 * A modification to Prism.Token.stringify
 * Converts the given token or token stream to an HTML representation with 
 * a theme specified.
 *
 * The following hooks will be run:
 * 1. `wrap`: On each {@link Token}.
 *
 * @param {string | Token | TokenStream} o The token or token stream to be converted.
 * @param {string} language The name of current language.
 * @param {object} theme The theme used to highlight, which looks like 
 *     DEFAULT_THEMES["light"] or so defined in themes.js. 
 * @returns {string} The HTML representation of the token or token stream.
 */
export function stringifyTokensWithTheme(o, language, theme) {
  if (typeof o == 'string') {
    return o;
  }
  if (Array.isArray(o)) {
    // var s = '';
    // o.forEach(function (e) {
    //   s += stringify(e, language);
    // });
    // return s;
    return o.map(e => stringifyTokensWithTheme(e, language, theme)).join("");
  }

  let typeAliases = [o.type, ...(!o.alias ? [] : Array.isArray(o.alias) ? o.alias : [o.alias])];
  var env = {
    type: o.type,
    content: stringifyTokensWithTheme(o.content, language, theme),
    tag: 'span',
    classes: ['token', ...typeAliases],
    attributes: {
      style: generateStyleAttr(typeAliases, theme)
    },
    language: language
  };

  // var aliases = o.alias;
  // if (aliases) {
  //   if (Array.isArray(aliases)) {
  //     Array.prototype.push.apply(env.classes, aliases);
  //   } else {
  //     env.classes.push(aliases);
  //   }
  // }

  // _.hooks.run('wrap', env);

  var attributes = '';
  for (var name in env.attributes) {
    attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
  }

  return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
};

/**
 * Generate CSS code to put into style attributes.
 * 
 * @param {string[]} types An array of token types. `types[0]` is the 
 *     main type, and others are the aliases.
 * @param {object} theme The theme used to highlight, which looks like 
 *     DEFAULT_THEMES["light"] or so defined in themes.js. 
 * @returns {string} The CSS code.
 */
export function generateStyleAttr(types, theme) {
  let { bgColor, textColor, punctuationColor, stringAndValueColor, operatorColor,
    keywordTagColor, commentColor, typeColor, numberColor, declarationColor, dimmedColor,
    highlightColor, lineHeight } = theme;

  let style = {};
  const matchesAny = targets => types.some(type => targets.includes(type));

  if(matchesAny(["comment", "prolog", "doctype", "cdata"]))
    style["color"] = commentColor;
  
  if(matchesAny(["namespace"]))
    style["opacity"] = `.7`;
  
  if(matchesAny(["string", "regex", "attr-value"]))
    style["color"] = stringAndValueColor;
  
  if(matchesAny(["punctuation"]))
    style["color"] = punctuationColor;

  if(matchesAny(["operator"]))
    style["color"] = operatorColor || punctuationColor;
  
  if(matchesAny(["entity", "url", "symbol", "number", "variable", "constant", "inserted"]))
    style["color"] = numberColor;
  
  if(matchesAny(["atrule", "class-name", "attr-name", "selector", "builtin"]))
    style["color"] = typeColor;

  
  if(matchesAny(["deleted", "property", "boolean", "keyword", "tag"]))
    style["color"] = keywordTagColor;
  
  if(matchesAny(["important", "metadata"]))
    style["color"] = declarationColor;
  
  if(matchesAny(["bold"]))
    style["font-weight"] = `bold`;
  
  if(matchesAny(["italic"]))
    style["font-style"] = `italic`;

  return Object.entries(style).map(([key, value]) => `${key}: ${value};`).join(" ");
};
