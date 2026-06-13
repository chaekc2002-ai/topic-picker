import { useState, useEffect } from 'react';
import { useAudio } from './hooks/useAudio';
import { lowGradeTopics, midGradeTopics, highGradeTopics } from './data/topics';
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
    const maxIterations = 30;
    
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
          const shuffled = [...topics].sort(() => 0.5 - Math.random());
          finalWinners = shuffled.slice(0, pickCount);
        }
        
        setWinners(finalWinners);
        onSpinEnd();
      }
    }, 100);
  };

  return (
    <div className="panel slot-machine-container">
      <div className="text-ui-label" style={{ color: 'var(--ink-soft)' }}>슬롯 머신 모듈</div>
      <div className="slot-window">
        <div className="slot-item">
          {currentDisplay}
        </div>
      </div>
      
      <button className="text-ui-label btn-signal" onClick={spin} disabled={isSpinning || topics.length === 0} style={{ width: '200px' }}>
        {isSpinning ? '추첨 중...' : '주제 뽑기 ▶'}
      </button>

      {winners.length > 0 && (
        <div className="winner-popup" onClick={() => setWinners([])}>
          <div className="winner-content panel-raised" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-display">당첨!</h2>
            {winners.map((winner, idx) => (
              <div key={idx} className="winner-item">{winner}</div>
            ))}
            <button className="text-ui-label btn-amber" onClick={() => setWinners([])} style={{ marginTop: '16px' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [grade, setGrade] = useState('저'); // 저, 중, 고
  const [generateCount, setGenerateCount] = useState(10);
  const [pickCount, setPickCount] = useState(1);
  const [topics, setTopics] = useState<string[]>([]);
  
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretText, setSecretText] = useState('');
  
  const { playWinSound } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        setShowSecretModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerate = () => {
    let sourceTopics: string[] = [];
    if (grade === '저') sourceTopics = lowGradeTopics;
    else if (grade === '중') sourceTopics = midGradeTopics;
    else if (grade === '고') sourceTopics = highGradeTopics;

    const shuffled = [...sourceTopics].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, generateCount);
    
    setTopics(selected);
    playWinSound(); 
  };

  const secretWinners = secretText.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="app-container">
      {/* Carbon Nav Bar */}
      <div className="nav-bar carbon-layer">
        <div className="text-display" style={{ color: 'var(--primary)', fontSize: '20px', background: 'white', padding: '2px 10px', borderRadius: '20px' }}>
          주제 생성기
        </div>
        <div className="nav-links text-ui-label">
          <span className="nav-link">게임</span>
          <span className="nav-link">시스템</span>
          <span className="nav-link">소식</span>
        </div>
        <div>
          <button className="text-ui-label btn-amber">주제 찾기</button>
        </div>
      </div>

      <div className="nav-sub-strip text-ui-label">
        <span className="nav-sub-link">학부모</span>
        <span className="nav-sub-link">고객 지원</span>
      </div>

      {/* Hero Panel */}
      <div className="hero-panel panel">
        <div style={{ position: 'relative' }}>
          <div className="mascot-bubble text-ui-label">
            환영합니다!
          </div>
          <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=teacher" alt="mascot" style={{ width: '80px', height: '80px', marginTop: '10px' }} />
        </div>
        <h1 className="hero-title text-display">랜덤<br/>글쓰기 주제<br/>생성기</h1>
        <div style={{ alignSelf: 'flex-end' }}>
          <button className="btn-signal" style={{ borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>▶</span>
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="section-label-bar text-ui-label">≡ 설정</div>
          <div className="settings-panel">
            <div className="setting-group">
              <label className="text-ui-label">학년 선택</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="저">저학년 (1-2학년)</option>
                <option value="중">중학년 (3-4학년)</option>
                <option value="고">고학년 (5-6학년)</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label className="text-ui-label">생성 개수</label>
              <input type="number" min="1" max="20" value={generateCount} onChange={(e) => setGenerateCount(Number(e.target.value))} />
            </div>

            <div className="setting-group">
              <label className="text-ui-label">뽑기 개수</label>
              <input type="number" min="1" max="5" value={pickCount} onChange={(e) => setPickCount(Number(e.target.value))} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="text-ui-label btn-signal"
                onClick={handleGenerate} 
                style={{ width: '100%' }}
              >
                생성하기 ▶
              </button>
            </div>
          </div>
        </div>

        {topics.length > 0 && (
          <>
            <div className="panel">
              <div className="section-label-bar text-ui-label">≡ 생성된 주제 ({topics.length})</div>
              <div className="topic-list-panel">
                {topics.map((t, i) => (
                  <div key={i} className="topic-item-row text-ui-label" style={{ textTransform: 'none', fontWeight: 'normal' }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            
            <SlotMachine 
              topics={topics} 
              pickCount={pickCount} 
              secretWinners={secretWinners}
              onSpinEnd={() => {}}
            />
          </>
        )}
      </div>

      {/* Teacher Secret Modal */}
      {showSecretModal && (
        <div className="secret-modal carbon-layer">
          <h3 className="text-ui-label">비밀 모드 (선생님 전용)</h3>
          <textarea 
            placeholder="예: 우리 반이 최고인 이유, 내가 가장 좋아하는 친구"
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
          />
          <button className="text-ui-label btn-amber" onClick={() => setShowSecretModal(false)} style={{ width: '100%' }}>숨기기</button>
        </div>
      )}
    </div>
  );
}

export default App;
