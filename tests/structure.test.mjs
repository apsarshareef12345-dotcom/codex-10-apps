import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const apps=['01-kanban-board','02-markdown-editor','03-expense-tracker','04-weather-dashboard','05-pomodoro-timer','06-recipe-finder','07-habit-tracker','08-code-snippet-manager','09-typing-speed-test','10-drawing-canvas'];
test('all app entry files exist',()=>apps.forEach(a=>['index.html','style.css','app.js'].forEach(f=>assert.ok(existsSync('apps/'+a+'/'+f)))));
test('dashboard links every app',()=>{const h=readFileSync('index.html','utf8');apps.forEach(a=>assert.match(h,new RegExp(a)));});
test('pages workflow exists',()=>assert.ok(existsSync('.github/workflows/deploy.yml')));
