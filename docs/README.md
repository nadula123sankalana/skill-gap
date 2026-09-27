# Documentation

| File | What it is |
| --- | --- |
| `SkillGap-Handbook.pdf` | User handbook — hand this to students and staff. |
| `skillgap-handbook.html` | Source of the handbook (web version, follows the reader's light/dark theme). |
| `skillgap-handbook.print.html` | Print build of the same content: light palette pinned, troubleshooting answers expanded, page breaks controlled. |

## Regenerating the PDF

Edit `skillgap-handbook.html`, then rebuild the print version and render it with
headless Chrome:

```bash
chrome --headless=new --disable-gpu --print-to-pdf-no-header \
  --print-to-pdf=docs/SkillGap-Handbook.pdf \
  file:///absolute/path/to/docs/skillgap-handbook.print.html
```

The print build strips the dark-theme blocks — headless Chrome reports a dark
colour-scheme preference, which would otherwise produce a dark PDF.
