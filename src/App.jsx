import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { processCSVData } from './utils/dataProcessor';
import StatCard from './components/StatCard';
import GradeChart from './components/GradeChart';
import {
    Users,
    Target,
    FileText,
    Users2,
    GraduationCap,
    TrendingUp,
    Award,
    AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const csvRes = await fetch('data.csv.enc');
            if (!csvRes.ok) throw new Error('無法讀取加密數據檔，請先執行加密腳本。');
            const encryptedCsv = await csvRes.text();

            const configRes = await fetch('config.json.enc');
            if (!configRes.ok) throw new Error('無法讀取加密配置檔');
            const encryptedConfig = await configRes.text();

            // Try to decrypt
            const decryptedCsvBytes = CryptoJS.AES.decrypt(encryptedCsv, loginPassword);
            const csvText = decryptedCsvBytes.toString(CryptoJS.enc.Utf8);

            const decryptedConfigBytes = CryptoJS.AES.decrypt(encryptedConfig, loginPassword);
            const configText = decryptedConfigBytes.toString(CryptoJS.enc.Utf8);

            if (!csvText || !configText) {
                throw new Error('密碼錯誤或數據損壞');
            }

            const configJson = JSON.parse(configText);
            const processed = processCSVData(csvText);

            setData(processed);
            setConfig(configJson);
            setIsAuthenticated(true);
            sessionStorage.setItem('stjohn_auth_token', loginPassword);
        } catch (err) {
            console.error("Login Error:", err);
            setError('密碼錯誤，請重新輸入。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const saved = sessionStorage.getItem('stjohn_auth_token');
        if (saved) {
            setLoginPassword(saved);
        }
    }, []);

    const getPersonalAnalysis = (student) => {
        if (!student) return { scores: [], strength: "", advice: "" };

        const scores = [
            { label: '期中考-基礎建模', value: student.Midterm || 0, avg: data?.overallStats?.Midterm?.mean || 0 },
            { label: '跨領域設計碰撞檢討', value: student['Assignment 1'] || 0, avg: data?.overallStats?.['Assignment 1']?.mean || 0 },
            { label: '進階參數化建模', value: student['Assignment 2'] || 0, avg: data?.overallStats?.['Assignment 2']?.mean || 0 },
            { label: '團體專題報告', value: student.Presentation || 0, avg: data?.overallStats?.Presentation?.mean || 0 },
        ];

        let strength = "";
        let advice = "";

        const studentId = student['Student ID'];
        const custom = config?.custom_comments?.[studentId];

        if (custom) {
            strength = custom.strength;
            advice = custom.advice;
        } else {
            const total = student.TOTAL || 0;
            const level = total > 85 ? 'high' : (total > 75 ? 'medium' : 'low');
            strength = config?.default?.[level]?.strength || "表現平穩，持續努力。";
            advice = config?.default?.[level]?.advice || "建議與老師討論進階學習目標。";
        }

        return { scores, strength, advice };
    };

    const getAnalysis = (key, stats) => {
        if (!stats) return "";
        const { mean, sd, max, min } = stats;
        if (key === 'Midterm') {
            return `期中考-基礎建模平均分數為 ${mean}，標準差為 ${sd}。最高分達 ${max}，但最低分僅 ${min}。`;
        }
        if (key === 'Assignment 1') {
            return `跨領域設計碰撞檢討的平均分為 ${mean}。多數同學能準確完成基本建模任務。`;
        }
        if (key === 'Assignment 2') {
            const missingCount = data.rawData.filter(d => (parseFloat(d['Assignment 2']) || 0) === 0).length;
            return `進階參數化建模的平均分為 ${mean}。最高分達 ${max}。約有 ${missingCount} 位同學未如期交件。`;
        }
        if (key === 'Presentation') {
            return `團體專題報告平均分高達 ${mean}。大部分小組展現了優異的協作能力。`;
        }
        if (key === 'TOTAL') {
            return `本學期總成績平均為 ${mean}。高分段比例顯著，展現出豐沛的學習潛力。`;
        }
        return "";
    };

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <GraduationCap size={64} className="login-icon" />
                        <h2>機密資料存取控制</h2>
                        <p>本教學儀表板包含學生個資，請輸入存取密碼。</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="請輸入密碼"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? '驗證中...' : '進入儀表板'}
                        </button>
                    </form>
                    <div className="login-footer">
                        <AlertCircle size={14} /> 數據已採用 AES-256 強度加密
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return <div className="loading">解密處理中...</div>;

    const comparisonData = [
        { name: 'GAMUDA 學生', score: data?.gamudaStats?.TOTAL?.mean || 0, fill: '#3b82f6' },
        { name: '非 GAMUDA 學生', score: data?.nonGamudaStats?.TOTAL?.mean || 0, fill: '#64748b' }
    ];

    const topStudents = [...(data?.rawData || [])]
        .sort((a, b) => (b.TOTAL || 0) - (a.TOTAL || 0))
        .slice(0, 10);

    return (
        <div className="container animated-fade-in">
            <header>
                <div className="badge">114學年度上學期</div>
                <h1>聖約翰產學合作專班 - 進階BIM理論與實務</h1>
                <p className="subtitle">學生成績表現與數據分析報告 (含教師意見)</p>
            </header>

            <div className="dashboard-grid">
                <StatCard title="全班總人數" value={data.counts.total} icon={Users} color="#6366f1" />
                <StatCard title="平均總成績" value={data.overallStats.TOTAL.mean} subValue={`中位數: ${data.overallStats.TOTAL.median}`} icon={Award} color="#10b981" />
                <StatCard title="GAMUDA 學生" value={data.counts.gamuda} icon={Target} color="#3b82f6" />
                <StatCard title="成績標準差" value={data.overallStats.TOTAL.sd} icon={TrendingUp} color="#f59e0b" />
            </div>

            <section>
                <div className="section-header">
                    <FileText size={24} />
                    <h2>單項成績詳細分析</h2>
                </div>
                <div className="grid-2">
                    {['Midterm', 'Assignment 1', 'Assignment 2', 'Presentation'].map((key, idx) => {
                        const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
                        const labels = { Midterm: '期中考-基礎建模', 'Assignment 1': '跨領域設計碰撞檢討', 'Assignment 2': '進階參數化建模', Presentation: '團體專題報告' };
                        return (
                            <div className="analysis-block" key={key}>
                                <GradeChart data={data.overallStats[key].data} stats={data.overallStats[key]} title={labels[key]} color={colors[idx]} />
                                <div className="qualitative-analysis">
                                    <h4>質化分析</h4>
                                    <p>{getAnalysis(key, data.overallStats[key])}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="highlight-section">
                <div className="section-header">
                    <Users2 size={24} />
                    <h2>群體總成績對比分析</h2>
                </div>
                <div className="comparison-layout">
                    <div className="comparison-chart">
                        <h3>GAMUDA vs. 非 GAMUDA 學生 (平均總分)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={40}>
                                        {comparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="comparison-text">
                        <div className="info-card">
                            <TrendingUp className="info-icon" />
                            <div>
                                <h4>分析說明</h4>
                                <p>
                                    GAMUDA 平均: <strong>{data.gamudaStats.TOTAL.mean}</strong> |
                                    非 GAMUDA 平均: <strong>{data.nonGamudaStats.TOTAL.mean}</strong>
                                </p>
                                <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {data.gamudaStats.TOTAL.mean > data.nonGamudaStats.TOTAL.mean
                                        ? "GAMUDA 學生在實務應用與專案執行上展現出更高的熟練度。"
                                        : "兩者成績相仿，顯示課程設計能有效縮短產學落差。"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="main-layout" style={{ marginTop: '64px' }}>
                <section className="top-students-section">
                    <div className="section-header">
                        <Award size={24} color="#f59e0b" />
                        <h2>榮譽榜 - 前 10 名頂尖表現</h2>
                    </div>
                    <div className="top-students-list">
                        {topStudents.map((s, idx) => (
                            <div
                                key={s['Student ID']}
                                className={`student-rank-card ${s.isGamuda ? 'gamuda-highlight' : ''} ${selectedStudent?.['Student ID'] === s['Student ID'] ? 'selected' : ''}`}
                                onClick={() => setSelectedStudent(s)}
                            >
                                <div className="rank-number">#{idx + 1}</div>
                                <div className="student-info">
                                    <div className="name-group">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span className="student-name-id">{s['NAME (Bahasa Indonesia)']}</span>
                                            {s.isGamuda && <span className="gamuda-badge">GAMUDA 學生</span>}
                                        </div>
                                        <span className="student-name-zh">{s['NAME (Mandarin)']}</span>
                                    </div>
                                    <div className="student-id">{s['Student ID']}</div>
                                </div>
                                <div className="student-score">
                                    <span className="score-value">{s.TOTAL}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="personal-analysis-section">
                    {selectedStudent ? (
                        <div className="personal-card">
                            <div className="personal-header">
                                <GraduationCap size={32} color="#6366f1" />
                                <div>
                                    <h3>個人能力特徵分析</h3>
                                    <div className="selected-student-names">
                                        {selectedStudent['NAME (Bahasa Indonesia)']} | {selectedStudent['NAME (Mandarin)']}
                                    </div>
                                </div>
                            </div>
                            <div className="personal-body">
                                {selectedStudent["teacher's comment"] && (
                                    <div className="analysis-item" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid var(--github-warning)' }}>
                                        <h5 style={{ color: 'var(--github-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={16} /> 教師意見
                                        </h5>
                                        <p style={{ color: 'var(--text-main)', marginTop: '8px' }}>{selectedStudent["teacher's comment"]}</p>
                                    </div>
                                )}
                                <div className="score-bars">
                                    {getPersonalAnalysis(selectedStudent).scores.map(s => (
                                        <div key={s.label} className="score-bar-row">
                                            <div className="bar-label">{s.label}</div>
                                            <div className="bar-track">
                                                <div className="bar-fill" style={{ width: `${s.value}%`, background: s.value >= s.avg ? 'var(--github-success)' : 'var(--accent-primary)' }}></div>
                                                <div className="avg-marker" style={{ left: `${s.avg}%` }} title="平均"></div>
                                            </div>
                                            <div className="bar-value">{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="personal-qualitative" style={{ marginTop: '24px' }}>
                                    <div className="analysis-item">
                                        <h5><TrendingUp size={14} /> 學習優勢</h5>
                                        <p>{getPersonalAnalysis(selectedStudent).strength}</p>
                                    </div>
                                    <div className="analysis-item" style={{ marginTop: '16px' }}>
                                        <h5><Target size={14} /> 發展建議</h5>
                                        <p>{getPersonalAnalysis(selectedStudent).advice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="personal-card empty">
                            <AlertCircle size={48} opacity={0.3} />
                            <p>點擊左側學生查看詳細分析與教師意見</p>
                        </div>
                    )}
                </section>
            </div>

            <footer>
                <p>© 114學年度進階BIM理論與實務課程數據分析系統</p>
            </footer>
        </div>
    );
}

export default App;
