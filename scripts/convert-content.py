#!/usr/bin/env python3
"""
One-shot converter: old docudjeex (Docus v3 / @nuxt-themes/docus MDC) markdown
-> new docudjeex-v2-docusv4 (Docus v4 / Nuxt UI MDC) markdown.

Docus v4 kept the same MDC block-component *syntax* (::name{props} ... ::)
but swapped the component *vocabulary* to Nuxt UI components:
  ::alert{type=info}                -> ::note
  ::alert{type=success} ("Tip:")    -> ::tip
  ::alert{type=warning}             -> ::warning
  ::alert{type=danger}              -> ::caution
  :::list{type=} (nested in alert)  -> unwrapped, passthrough
  ::card{icon=} #title #description -> ::card{icon="i-x" title="T"} description ::
  ::card-grid ... #title #default   -> "### Title" + ::card-group ... ::
  ::terminal (yaml content: list)   -> ```console fenced block
  ::code-group                      -> unchanged (same syntax in both versions)
  :ellipsis{...}                    -> dropped (Docus v3-only decoration)
  [text]{style="..."}               -> unchanged (generic MDC inline syntax)
  icon `prefix:name`                -> `i-prefix-name` (Nuxt Icon: full Iconify catalog)

Usage: convert-content.py <src.md> <dest.md>
"""
import re
import sys
from pathlib import Path

FENCE_OPEN = re.compile(r'^(\s*)(:{2,})([\w-]+)(\{(.*)\})?\s*$')
FENCE_CLOSE = re.compile(r'^\s*(:{2,})\s*$')


def convert_icon(raw):
    raw = raw.strip()
    if ':' not in raw:
        return raw
    prefix, name = raw.split(':', 1)
    return f"i-{prefix}-{name}"


def parse_props(props_str):
    props = {}
    if not props_str:
        return props
    for m in re.finditer(r'([\w-]+)=("([^"]*)"|(\S+))', props_str):
        key = m.group(1)
        val = m.group(3) if m.group(3) is not None else m.group(4)
        props[key] = val
    return props


class Node:
    def __init__(self, kind, name=None, props=None):
        self.kind = kind
        self.name = name
        self.props = props or {}
        self.children = []


def parse_blocks(lines):
    root = Node('component', name='__root__')
    stack = [root]
    text_buf = []

    def flush_text():
        if text_buf:
            n = Node('text')
            n.children = text_buf[:]
            stack[-1].children.append(n)
            text_buf.clear()

    for line in lines:
        close_m = FENCE_CLOSE.match(line)
        open_m = FENCE_OPEN.match(line)
        if close_m and len(stack) > 1:
            flush_text()
            stack.pop()
            continue
        if open_m:
            flush_text()
            name = open_m.group(3)
            props = parse_props(open_m.group(5))
            node = Node('component', name=name, props=props)
            stack[-1].children.append(node)
            stack.append(node)
            continue
        text_buf.append(line)
    flush_text()
    return root


def indent(text, n=2):
    pad = ' ' * n
    return '\n'.join(pad + line if line.strip() else line for line in text.split('\n'))


def render_children(node):
    return '\n'.join(render_node(c) for c in node.children)


def split_slots(node):
    slots = {'__default__': []}
    current = '__default__'
    for c in node.children:
        if c.kind == 'text':
            for line in c.children:
                m = re.match(r'^\s*#(\w+)\s*$', line)
                if m:
                    current = m.group(1)
                    slots.setdefault(current, [])
                else:
                    slots[current].append(line)
        else:
            slots.setdefault(current, [])
            slots[current].append(c)
    return slots


def render_slot(slot_items):
    parts, buf = [], []
    for item in slot_items:
        if isinstance(item, str):
            buf.append(item)
        else:
            if buf:
                parts.append('\n'.join(buf))
                buf = []
            parts.append(render_node(item))
    if buf:
        parts.append('\n'.join(buf))
    return '\n'.join(parts).strip('\n')


ALERT_TYPE_MAP = {
    'info': 'note',
    'success': 'tip',  # Docus's "success" was always used for "✨ Tip:" callouts
    'warning': 'warning',
    'danger': 'caution',
}


def render_alert(node):
    atype = node.props.get('type', 'info')
    new_name = ALERT_TYPE_MAP.get(atype, 'note')
    body = render_children(node).strip('\n')
    return f"::{new_name}\n{body}\n::"


def render_list(node):
    return render_children(node).strip('\n')


def render_card(node):
    slots = split_slots(node)
    icon = convert_icon(node.props.get('icon', ''))
    title = render_slot(slots.get('title', [])).strip()
    title = re.sub(r'^__(.*)__$', r'\1', title)
    desc = render_slot(slots.get('description', [])).strip()
    props = []
    if icon:
        props.append(f'icon="{icon}"')
    if title:
        title_escaped = title.replace('"', '\\"')
        props.append(f'title="{title_escaped}"')
    props_str = '{' + ' '.join(props) + '}' if props else ''
    return f"::card{props_str}\n{desc}\n::"


def render_card_grid(node):
    slots = split_slots(node)
    title = render_slot(slots.get('title', [])).strip()
    default_items = slots.get('default', [])
    cards = [render_node(c) for c in default_items if not isinstance(c, str)]
    out = []
    if title:
        out.append(f"### {title}")
        out.append("")
    out.append("::card-group")
    out.append('\n\n'.join(cards))
    out.append("::")
    return '\n'.join(out)


def render_terminal(node):
    text = render_children(node)
    m = re.search(r'content:\s*\n((?:\s*-.*\n?)+)', text)
    lines_out = []
    if m:
        for item in re.finditer(r'^\s*-\s*(.*)$', m.group(1), re.M):
            lines_out.append(item.group(1))
    return "```console\n" + '\n'.join(lines_out) + "\n```"


def render_code_group(node):
    # Same syntax in both versions: reconstruct verbatim.
    body = render_children(node).strip('\n')
    return f"::code-group\n{body}\n::"


RENDERERS = {
    'alert': render_alert,
    'list': render_list,
    'card': render_card,
    'card-grid': render_card_grid,
    'terminal': render_terminal,
    'code-group': render_code_group,
}


def render_node(node):
    if node.kind == 'text':
        return '\n'.join(node.children)
    if node.name == '__root__':
        return render_children(node)
    fn = RENDERERS.get(node.name)
    if fn is None:
        inner = render_children(node)
        return f"<!-- UNCONVERTED ::{node.name} -->\n{inner}\n<!-- /UNCONVERTED -->"
    return fn(node)


def strip_ellipsis(text):
    return re.sub(r'^\s*:ellipsis\{[^}]*\}\s*\n?', '', text, flags=re.M)


LIST_START_RE = re.compile(r'^\s*([-*]\s|\d+\.\s)')


def fix_list_starts(text):
    """Nuxt Content's remark-based parser is generally lenient, but keep this
    guard (proved necessary for the Zensical/Python-Markdown port) in case a
    list-directly-after-text pattern needs it here too."""
    lines = text.split('\n')
    out = []
    for line in lines:
        if LIST_START_RE.match(line) and out and out[-1].strip() != '' and not LIST_START_RE.match(out[-1]):
            out.append('')
        out.append(line)
    return '\n'.join(out)


def convert_frontmatter(fm_text):
    keep = {}
    for m in re.finditer(r'^(title|description):\s*(.*)$', fm_text, re.M):
        keep[m.group(1)] = m.group(2)
    icon_m = re.search(r'^icon:\s*(\S+)', fm_text, re.M)
    icon_line = f"navigation:\n  icon: {convert_icon(icon_m.group(1))}\n" if icon_m else ""
    lines = ['---']
    if 'title' in keep:
        lines.append(f"title: {keep['title']}")
    if 'description' in keep:
        lines.append(f"description: {keep['description']}")
    if icon_line:
        lines.append(icon_line.rstrip('\n'))
    lines.append('---')
    return '\n'.join(lines)


def convert_file(src_path: Path, dest_path: Path):
    raw = src_path.read_text(encoding='utf-8')
    fm_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', raw, re.S)
    if fm_match:
        fm_text, body = fm_match.group(1), fm_match.group(2)
        new_fm = convert_frontmatter(fm_text)
    else:
        new_fm, body = '', raw

    body = strip_ellipsis(body)
    # Inline icon props like {icon=logos:docker-icon} outside of the ::card
    # renderer (none expected after conversion, but harmless if present).
    root = parse_blocks(body.split('\n'))
    converted = render_node(root)
    converted = fix_list_starts(converted)
    converted = re.sub(r'\n{3,}', '\n\n', converted)

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    out = (new_fm + '\n\n' + converted.strip() + '\n') if new_fm else (converted.strip() + '\n')
    dest_path.write_text(out, encoding='utf-8')

    return 'UNCONVERTED' in converted


if __name__ == '__main__':
    src, dest = Path(sys.argv[1]), Path(sys.argv[2])
    if convert_file(src, dest):
        print(f"WARNING: unconverted constructs remain in {dest}")
