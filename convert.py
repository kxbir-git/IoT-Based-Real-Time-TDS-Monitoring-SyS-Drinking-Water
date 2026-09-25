import re
import json

html_path = r"c:\- AquaSense -\AquaSense\Stitch_Export\TDS_Telemetry_Dashboard.html"
app_jsx_path = r"c:\- AquaSense -\AquaSense\frontend\src\App.jsx"

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract body content
body_content_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if body_content_match:
    content = body_content_match.group(1)
    
    # Encode content as JSON string to safely put in JS
    content_js = json.dumps(content)
    
    app_jsx = f"""import React from 'react';

function App() {{
  return (
    <div dangerouslySetInnerHTML={{{{ __html: {content_js} }}}} />
  );
}}

export default App;
"""
    with open(app_jsx_path, 'w', encoding='utf-8') as f:
        f.write(app_jsx)
