import { useState, useEffect } from 'react';
import { useOpenAI } from './hooks/useOpenAI';
import { useAudio } from './hooks/useAudio';
import './App.css';

const SlotMachine = ({ 
  topics, 
  pickCount, 
  secretWinners, 
  onSpinEnd 
}: { 
  topics: string[]; 
  pickCount: number; 
  secretWinners: string[];
  onSpinEnd: () => void;
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('?');
  const [winners, setWinners] = useState<string[]>([]);
  const { playSpinSound, playWinSound } = useAudio();
  
  const spin = () => {
    if (topics.length === 0) return;
    setIsSpinning(true);
    setWinners([]);
    
    let iterations = 0;
    const maxIterations = 30; // Number of "ticks"
    
    const interval = setInterval(() => {
      playSpinSound();
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      setCurrentDisplay(randomTopic);
      
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsSpinning(false);
        playWinSound();
        
        let finalWinners: string[] = [];
        if (secretWinners.length > 0) {
          finalWinners = [...secretWinners].slice(0, pickCount);
        } else {
          // pick randomly
          const shuffled = [...topics].sort(() => 0.5 - Math.random());
          finalWinners = shuffled.slice(0, pickCount);
        }
        
        setWinners(finalWinners);
        onSpinEnd();
      }
    }, 100);
  };

  return (
    <div className="slot-machine-container glass-panel">
      <h2>주제 뽑기 슬롯머신 🎰</h2>
      <div className="slot-window">
        <div className="slot-item">
          {currentDisplay}
        </div>
      </div>
      
      <button onClick={spin} disabled={isSpinning || topics.length === 0} style={{ marginTop: '1rem', width: '200px' }}>
        {isSpinning ? '돌아가는 중...' : '뽑기 시작!'}
      </button>

      {winners.length > 0 && (
        <div className="winner-popup" onClick={() => setWinners([])}>
          <div className="winner-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 축하합니다! 오늘의 글쓰기 주제 🎉</h2>
            {winners.map((winner, idx) => (
              <div key={idx} className="winner-item">✨ {winner}</div>
            ))}
            <button onClick={() => setWinners([])} style={{ marginTop: '2rem' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [apiKey, setApiKey] = useState('');
  const [grade, setGrade] = useState('저'); // 저, 중, 고
  const [generateCount, setGenerateCount] = useState(10);
  const [pickCount, setPickCount] = useState(1);
  const [topics, setTopics] = useState<string[]>([]);
  
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretText, setSecretText] = useState('');
  
  const { generateTopics, isLoading, error } = useOpenAI();
  const { playWinSound } = useAudio();

  // Load API Key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setApiKey(savedKey);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        setShowSecretModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('OpenAI API 키를 입력해주세요.');
      return;
    }
    const result = await generateTopics(apiKey, grade, generateCount);
    if (result.length > 0) {
      setTopics(result);
      playWinSound(); // simple tada on completion
    }
  };

  const secretWinners = secretText.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="app-container">
      <h1>✨ 랜덤 글쓰기 주제 생성기</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="settings-grid">
          <div className="setting-group">
            <label>학년 수준</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="저">저학년 (1-2학년)</option>
              <option value="중">중학년 (3-4학년)</option>
              <option value="고">고학년 (5-6학년)</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>생성할 주제 개수</label>
            <input type="number" min="1" max="20" value={generateCount} onChange={(e) => setGenerateCount(Number(e.target.value))} />
          </div>

          <div className="setting-group">
            <label>뽑을 주제 개수</label>
            <input type="number" min="1" max="5" value={pickCount} onChange={(e) => setPickCount(Number(e.target.value))} />
          </div>

          <div className="setting-group">
            <label>OpenAI API 키 (브라우저에만 저장됨)</label>
            <input 
              type="password" 
              placeholder="sk-..." 
              value={apiKey} 
              onChange={(e) => saveApiKey(e.target.value)} 
            />
          </div>
        </div>
        
        <button 
          onClick={handleGenerate} 
          disabled={isLoading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {isLoading ? '생성 중...' : '주제 생성하기'}
        </button>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>

      {topics.length > 0 && (
        <>
          <div className="glass-panel topic-list-container">
            <h2>생성된 주제 목록 ({topics.length}개)</h2>
            <ul className="topic-list">
              {topics.map((t, i) => (
                <li key={i} className="topic-item">{t}</li>
              ))}
            </ul>
          </div>
          
          <SlotMachine 
            topics={topics} 
            pickCount={pickCount} 
            secretWinners={secretWinners}
            onSpinEnd={() => {}}
          />
        </>
      )}

      {showSecretModal && (
        <div className="secret-modal">
          <h3>비밀 모드 (교사용) 🤫</h3>
          <p style={{ fontSize: '0.8rem', marginBottom: '1rem', color: '#ccc' }}>
            슬롯머신에서 100% 당첨될 주제를 쉼표(,)로 구분해서 입력하세요.
          </p>
          <textarea 
            placeholder="예: 우리 반이 최고인 이유, 내가 가장 좋아하는 친구"
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
          />
          <button onClick={() => setShowSecretModal(false)} style={{ width: '100%' }}>숨기기</button>
        </div>
      )}
    </div>
  );
}

export default App;
