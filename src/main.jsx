import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.onerror = function (msg, url, line, col, error) {
    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.padding = '20px';
    errorMsg.style.background = 'white';
    errorMsg.style.position = 'fixed';
    errorMsg.style.top = '0';
    errorMsg.style.zIndex = '9999';
    errorMsg.innerText = `Runtime Error: ${msg}\nLine: ${line}\nColumn: ${col}`;
    document.body.appendChild(errorMsg);
    return false;
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
