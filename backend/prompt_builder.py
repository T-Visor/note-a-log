from jinja2 import Template

class PromptBuilder:
    def __init__(self, template_str):
        # Initialize the Jinja2 template
        self.template = Template(template_str)

    def render(self, **kwargs):
        # Render the template with dynamic arguments
        return self.template.render(**kwargs)

# Example usage
template_str = "Write a story about a {{ animal }} who lives in {{ place }}."
prompt_builder = PromptBuilder(template_str)

# Dynamic values
context = {
    'animal': 'fox',
    'place': 'the forest'
}

# Render the prompt
rendered_prompt = prompt_builder.render(**context)

print(rendered_prompt)  # Output: Write a story about a fox who lives in the forest.

