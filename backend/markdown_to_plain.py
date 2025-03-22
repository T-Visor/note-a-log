from markdown_it import MarkdownIt
from mdit_plain.renderer import RendererPlain


def strip_markdown(markdown_text: str) -> str:
    """
    Convert a Markdown string to plain text by stripping Markdown-specific characters.

    :param markdown_text: The Markdown-formatted string.
    :return: A plain text string with Markdown formatting removed.
    """
    parser = MarkdownIt(renderer_cls=RendererPlain)
    plain_text = parser.render(markdown_text)
    return plain_text
