from markdown_it import MarkdownIt
from mdit_plain.renderer import RendererPlain

def strip_markdown(md_text: str) -> str:
    """
    Convert a Markdown string to plain text by stripping Markdown-specific characters.

    :param md_text: The Markdown-formatted string.
    :return: A plain text string with Markdown formatting removed.
    """
    parser = MarkdownIt(renderer_cls=RendererPlain)
    plain_text = parser.render(md_text)
    return plain_text

md_content = """
# Sample Title

This is a **bold** statement with a [link](https://example.com).

- Item 1
- Item 2
- Item 3
"""

plain_text = strip_markdown(md_content)
print(plain_text)
