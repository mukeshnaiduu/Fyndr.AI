import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const CodeEditorPanel = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(14);
  const [isCollaborating, setIsCollaborating] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const textareaRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' }
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const fontSizes = [
    { value: 12, label: '12px' },
    { value: 14, label: '14px' },
    { value: 16, label: '16px' },
    { value: 18, label: '18px' }
  ];

  useEffect(() => {
    // Mock initial code based on language
    const codeTemplates = {
      javascript: `// Welcome to the coding interview!
// Feel free to write your solution here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
      python: `# Welcome to the coding interview!
# Feel free to write your solution here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
      java: `// Welcome to the coding interview!
// Feel free to write your solution here

public class Solution {
    public int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.fibonacci(10));
    }
}`,
      cpp: `// Welcome to the coding interview!
// Feel free to write your solution here

#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << fibonacci(10) << endl;
    return 0;
}`,
      html: `<!-- Welcome to the coding interview! -->
<!-- Feel free to write your solution here -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Solution</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
      css: `/* Welcome to the coding interview! */
/* Feel free to write your solution here */

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
    padding: 2rem;
    border-radius: 1rem;
    background: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}`,
      sql: `-- Welcome to the coding interview!
-- Feel free to write your solution here

SELECT 
    u.name,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
ORDER BY total_spent DESC;`
    };

    setCode(codeTemplates[language] || '');
  }, [language]);

  useEffect(() => {
    // Mock collaborators
    setCollaborators([
      {
        id: 1,
        name: 'Sarah Johnson',
        color: '#a78bfa',
        cursor: { line: 5, column: 12 }
      },
      {
        id: 2,
        name: 'Mike Chen',
        color: '#fb923c',
        cursor: { line: 8, column: 4 }
      }
    ]);
  }, []);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleRunCode = () => {
    // Mock code execution
    console.log('Running code:', code);
    // In a real implementation, this would send code to a backend service
  };

  const handleFormatCode = () => {
    // Mock code formatting
    const formatted = code.replace(/\s+/g, ' ').trim();
    setCode(formatted);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleSaveCode = () => {
    // Mock save functionality
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getThemeClasses = () => {
    return theme === 'dark' ?'bg-gray-900 text-gray-100 border-gray-700' :'bg-white text-gray-900 border-gray-300';
  };

  return (
    <div className="h-full flex flex-col glassmorphic rounded-squircle">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Code" size={20} className="text-primary" />
          <h3 className="font-heading font-heading-semibold text-foreground">
            Code Editor
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isCollaborating && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-success font-body font-body-medium">
                Live
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRunCode}
            iconName="Play"
            iconSize={16}
            className="text-success hover:text-success"
          />
        </div>
      </div>

      {/* Editor Controls */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Language Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-body font-body-medium text-foreground">
              Language:
            </span>
            <Select
              options={languages}
              value={language}
              onChange={setLanguage}
              className="w-32"
            />
          </div>

          {/* Theme Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-body font-body-medium text-foreground">
              Theme:
            </span>
            <Select
              options={themes}
              value={theme}
              onChange={setTheme}
              className="w-24"
            />
          </div>

          {/* Font Size */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-body font-body-medium text-foreground">
              Size:
            </span>
            <Select
              options={fontSizes}
              value={fontSize}
              onChange={setFontSize}
              className="w-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormatCode}
              iconName="AlignLeft"
              iconPosition="left"
              iconSize={14}
            >
              Format
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              iconName="Copy"
              iconPosition="left"
              iconSize={14}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveCode}
              iconName="Download"
              iconPosition="left"
              iconSize={14}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          className={`w-full h-full p-4 font-data resize-none focus:outline-none ${getThemeClasses()}`}
          style={{ fontSize: `${fontSize}px` }}
          placeholder={`Start coding in ${language}...`}
          spellCheck={false}
        />

        {/* Collaborator Cursors */}
        {isCollaborating && collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="absolute pointer-events-none"
            style={{
              top: `${collaborator.cursor.line * 1.5}rem`,
              left: `${collaborator.cursor.column * 0.6}rem`,
              color: collaborator.color
            }}
          >
            <div className="flex items-center space-x-1">
              <div 
                className="w-0.5 h-4 animate-pulse"
                style={{ backgroundColor: collaborator.color }}
              />
              <span 
                className="text-xs px-2 py-1 rounded text-white font-body font-body-medium"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name}
              </span>
            </div>
          </div>
        ))}

        {/* Line Numbers */}
        <div className="absolute left-0 top-0 p-4 text-muted-foreground font-data text-right select-none pointer-events-none">
          {code.split('\n').map((_, index) => (
            <div key={index} style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {language.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center space-x-1"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: collaborator.color }}
              />
              <span>{collaborator.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-24 left-12 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-32 right-8 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '5s' }}></div>
      </div>
    </div>
  );
};

export default CodeEditorPanel;
