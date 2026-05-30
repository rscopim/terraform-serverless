# CloudTrilhas — Novo Visual 2026

## Como visualizar

Abra o arquivo `index.html` diretamente no navegador para ver o novo design.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `style.css` | CSS completo do novo visual |
| `index.html` | Página inicial com o novo design (preview) |
| `animations.js` | Micro-interações e scroll animations |

## Mudanças em relação ao visual atual

### Paleta de Cores
- **Antes**: Sky blue (#38bdf8) + Dark navy (#0f172a)
- **Agora**: Indigo/Violet (#6366f1) + Cyan (#06b6d4) + Deep dark (#0a0a1a)
- Gradientes aurora com mesh animado no hero

### Design System
- **Glassmorphism**: Header e cards com backdrop-filter blur
- **Gradientes vibrantes**: Botões e acentos com gradiente indigo→cyan
- **Micro-interações**: Hover com glow, cards com borda top animada
- **Scroll animations**: Elementos aparecem suavemente ao entrar na viewport
- **Parallax sutil**: Hero panel com movimento no scroll

### Tipografia
- Font Inter via Google Fonts (carregamento otimizado)
- Títulos hero com gradient text (background-clip)
- Pesos: 400-800 (mais variação que o atual)

### Cards
- Borda top com gradiente que aparece no hover
- Sombra glow (roxo sutil) no hover
- Transições mais suaves (cubic-bezier)
- Link com seta animada (→ que se afasta no hover)

### Hero
- Background mesh animado (radial gradients flutuantes)
- Texto com gradient (branco → indigo → cyan)
- Painel lateral com glassmorphism
- Animação slideUp no carregamento

### Footer
- Linha superior com gradiente luminoso
- Links com translateX no hover
- Mais espaçamento e hierarquia visual

### Responsividade
- Breakpoints: 1024px, 768px, 640px
- Grid adaptativo (4→2→1 colunas)
- Navegação simplificada em mobile

## Como aplicar ao site

Para substituir o visual atual:
1. Copie o conteúdo de `style.css` para `static_site/style.css`
2. Adicione o Google Fonts no `<head>` de cada HTML
3. Adicione `animations.js` antes do `</body>`
4. Remova referências ao `hero-grid.svg` (substituído por CSS puro)
