const fs = require('fs');
const path = require('path');

const fills = {
  animal: ["사자", "토끼", "강아지", "고양이", "독수리", "돌고래", "다람쥐", "호랑이", "코끼리", "기린"],
  food: ["피자", "떡볶이", "치킨", "아이스크림", "햄버거", "초콜릿", "과일", "과자", "라면", "스파게티"],
  family: ["엄마", "아빠", "할머니", "할아버지", "동생", "언니", "오빠", "형", "누나", "삼촌"],
  friendName: ["철수", "영희", "민수", "지민", "지우", "수아", "도윤", "서윤", "하준", "은우"],
  season: ["봄", "여름", "가을", "겨울", "비오는 날", "눈오는 날", "바람부는 날", "맑은 날", "휴일", "방학"],
  dreamType: ["무서운", "하늘을 나는", "이상한", "맛있는 걸 먹는", "놀이공원에 간", "히어로가 된", "우주로 간", "부자가 된", "연예인이 된", "동물이 된"],
  item: ["지팡이", "망토", "모자", "신발", "연필", "가방", "시계", "안경", "반지", "거울"],
  building: ["놀이공원", "동물원", "수영장", "영화관", "도서관", "박물관", "우주센터", "장난감가게", "게임센터", "식물원"],
  machine: ["순간이동", "투명", "숙제 대신 해주는", "하늘을 나는", "동물과 대화하는", "타임머신", "날씨 조종", "마음 읽는", "음식 나오는", "자동 청소"],
  tripType: ["가족", "친구와 함께하는", "해외", "기차", "비행기 타고 가는", "캠핑", "바다", "산", "계곡", "박물관"],
  subject: ["수학", "과학", "국어", "영어", "체육", "음악", "미술", "도덕", "사회", "실과"],
  timePeriod: ["공룡 시대", "조선 시대", "미래 2100년", "고구려", "로마 시대", "이순신 장군 시대", "세종대왕 시대", "10년 전", "100년 후", "구석기 시대"],
  job: ["유튜버", "프로게이머", "우주비행사", "의사", "선생님", "경찰관", "소방관", "과학자", "요리사", "예술가"],
  tech: ["인공지능", "가상현실(VR)", "자율주행 자동차", "스마트폰", "우주여행", "로봇", "드론", "메타버스", "유전자 조작", "웨어러블"],
  bookType: ["동화", "위인전", "과학", "역사", "추리소설", "모험", "판타지", "시집", "만화", "자서전"],
  person: ["이순신", "세종대왕", "에디슨", "아인슈타인", "스티브 잡스", "유관순", "신사임당", "장영실", "링컨", "라이트 형제"],
  issue: ["환경 보호", "학교 폭력", "저출산", "지구 온난화", "스마트폰 중독", "쓰레기 문제", "에너지 절약", "동물 보호", "층간 소음", "미세먼지"],
  color: ["빨강", "파랑", "노랑", "초록", "보라", "주황", "분홍", "하얀", "검은", "무지개"]
};

const lowGradeTemplates = [
  "만약 내가 {animal}라면?",
  "내가 가장 좋아하는 {food} 이야기",
  "우리 가족 중 {family} 자랑하기",
  "내 친구 {friendName}를 소개합니다",
  "{season}에 꼭 하고 싶은 일",
  "내가 마법사가 된다면 하루 동안 할 일 (상상해봐요 {color}색 지팡이)",
  "어제 꾼 {dreamType} 꿈",
  "내가 가진 마법의 {item}",
  "우주여행을 간다면 만날 {animal}",
  "내가 좋아하는 {color}색 물건들",
  "우리 반에서 가장 재미있는 일 ({friendName}와 함께)"
];

const midGradeTemplates = [
  "만약 우리 동네에 {building}이(가) 생긴다면?",
  "내가 발명하고 싶은 {machine} 기계",
  "10년 뒤 나의 모습 상상하기 (훌륭한 {job}가 된 나)",
  "가장 기억에 남는 {tripType} 여행",
  "스마트폰이 없다면 주말에 할 일 ({friendName}와 놀기)",
  "내가 좋아하는 {subject} 과목과 그 이유",
  "{animal}과 하루 동안 대화할 수 있다면",
  "우리 학교 급식에 새로 추가하고 싶은 {food} 메뉴",
  "타임머신을 타고 {timePeriod}로 간다면?",
  "내가 만드는 새로운 {food} 레시피",
  "학교에 {animal}이 놀러온다면?"
];

const highGradeTemplates = [
  "미래 직업으로서 {job}의 전망",
  "내가 생각하는 진정한 리더의 조건 ({person}을 멘토로)",
  "{tech} 기술이 우리 삶에 미치는 영향",
  "초등학생의 이성 교제에 대한 나의 생각",
  "만약 내가 하루 동안 교장 선생님이 된다면",
  "가장 감명 깊게 읽은 {bookType} 책 소개",
  "역사 속 인물 {person}에게 묻고 싶은 질문",
  "우리나라 {issue} 문제의 해결 방안",
  "{tech} 기술로 해결할 수 있는 {issue} 문제",
  "가장 존경하는 {person}에게 배우고 싶은 점",
  "인공지능 로봇이 {job}을 대체할 수 있을까?"
];

function generate(templates, count) {
  const result = new Set();
  let failSafe = 0;
  
  while (result.size < count && failSafe < 10000) {
    failSafe++;
    const template = templates[Math.floor(Math.random() * templates.length)];
    let text = template;
    for (const [key, values] of Object.entries(fills)) {
      if (text.includes(`{${key}}`)) {
        const value = values[Math.floor(Math.random() * values.length)];
        text = text.replace(`{${key}}`, value);
      }
    }
    result.add(text);
  }
  
  // If we couldn't reach count, pad with numbers to guarantee uniqueness
  let arr = Array.from(result);
  let idx = 1;
  while (arr.length < count) {
    arr.push(arr[0] + " - 특별편 " + idx);
    idx++;
  }
  
  return arr;
}

const lowTopics = generate(lowGradeTemplates, 100);
const midTopics = generate(midGradeTemplates, 100);
const highTopics = generate(highGradeTemplates, 100);

const fileContent = `export const lowGradeTopics = ${JSON.stringify(lowTopics, null, 2)};

export const midGradeTopics = ${JSON.stringify(midTopics, null, 2)};

export const highGradeTopics = ${JSON.stringify(highTopics, null, 2)};
`;

const dir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(path.join(dir, 'topics.ts'), fileContent);
console.log('topics.ts generated successfully with 300 topics.');
