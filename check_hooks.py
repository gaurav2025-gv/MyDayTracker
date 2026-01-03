import os
import re

hook_pattern = re.compile(r'\b(useState|useEffect|useRef|useMemo|useCallback|useContext|useReducer|useLayoutEffect)\b\s*\(')
import_react_pattern = re.compile(r'import\s+.*?from\s+[\'\"]react[\'\"]')

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                hooks_found = set(hook_pattern.findall(content))
                if hooks_found:
                    # Check for any React import
                    react_import_match = import_react_pattern.search(content)
                    if not react_import_match:
                        # No React import at all, check if they use React.useState
                        for hook in hooks_found:
                            if f'React.{hook}' not in content:
                                print(f"CRITICAL: {hook} used without React import in {path}")
                    else:
                        # React is imported, check if hooks are destructured or used via React.
                        import_stmt = react_import_match.group(0)
                        for hook in hooks_found:
                            # Is the hook in the import statement?
                            if hook not in import_stmt:
                                # Is it used via React.hook?
                                if f'React.{hook}' not in content:
                                    # Maybe it is imported in a multi-line import that we missed?
                                    # Let's check the whole file for the hook in an import from react
                                    full_import_pattern = re.compile(rf'import\s+[^;]*?\{{[^}}]*?\b{hook}\b[^}}]*?\}}[^;]*?from\s+[\'\"]react[\'\"]')
                                    if not full_import_pattern.search(content):
                                        print(f"MISSING IMPORT: {hook} in {path}")
