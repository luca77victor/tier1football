import React, { useState, useEffect } from 'react';
import { Newspaper, Search, X, ExternalLink, Activity, Trophy, Database, Shield, BarChart2, Zap } from 'lucide-react';

// 🌐 [PRODUCTION ENVIRONMENT VARIABLES]: รองรับการสลับ URL ระหว่าง Dev และ Production บน Cloudflare/GitHub
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 📊 [DATABASE แกนหลัก]: ฐานข้อมูลสถิตินักเตะพร้อมสถิติการลงเล่นและเรตติ้งเฉลี่ยฤดูกาลจริง
const squadDatabase = [
  // 🔴 Manchester United 
  { team: 'Manchester United', player_name: "Kobbie Mainoo", image: "/players/mainoo.png", class_name: "The Deep-Lying Playmaker", sub_title: "มิดฟิลด์ดาวรุ่งอัจฉริยะแห่งยุคของปีศาจแดง", glow_color: "from-red-600 to-red-900", stats: { passing: 88, intercept: 82, tackle: 80, stamina: 85, speed: 76 }, analysis: "คุมจังหวะแดนกลางเนียนตา แกะเพรสซิ่งเก่ง และเป็นหัวใจหลักในยุคใหม่ของทีม", match_stats: { rating: "7.35", apps: "32", goals: "3", assists: "5" } },
  { team: 'Manchester United', player_name: "Manuel Ugarte", image: "/players/ugarte.png", class_name: "The Ball-Winning Midfielder", sub_title: "เครื่องจักรปัดกวาดแดนกลางคนใหม่", glow_color: "from-red-600 to-red-900", stats: { tackle: 92, intercept: 89, stamina: 95, passing: 80, speed: 78 }, analysis: "ดุดัน กัดไม่ปล่อย เติมเต็มช่องโหว่เกมรับในแดนกลางได้อย่างสมบูรณ์แบบ", match_stats: { rating: "7.18", apps: "28", goals: "1", assists: "2" } },
  { team: 'Manchester United', player_name: "Leny Yoro", image: "/players/yoro.png", class_name: "The Generational Defender", sub_title: "ปราการหลังดาวรุ่งค่าตัวแพง อนาคตแนวรับ", glow_color: "from-red-600 to-red-900", stats: { tackle: 85, intercept: 88, speed: 82, passing: 80, stamina: 80 }, analysis: "นิ่งเกินวัย อ่านเกมขาด และมีความเร็วพอที่จะจัดการกับกองหน้าตัวจี๊ดได้สบาย", match_stats: { rating: "7.25", apps: "26", goals: "2", assists: "1" } },
  { team: 'Manchester United', player_name: "Joshua Zirkzee", image: "/players/zirkzee.png", class_name: "The False 9", sub_title: "กองหน้าสายเชื่อมเกม ทักษะแพรวพราว", glow_color: "from-red-600 to-red-900", stats: { shooting: 82, passing: 84, speed: 75, stamina: 82, tackle: 45 }, analysis: "ชอบถอยลงมาล้วงบอลเพื่อดึงตัวประกบ เปิดทางให้ปีกทั้งสองข้างสอดขึ้นไปทำประตู", match_stats: { rating: "7.05", apps: "24", goals: "8", assists: "4" } },
  { team: 'Manchester United', player_name: "Bryan Mbeumo", image: "/players/mbuemo.png", class_name: "The Explosive Winger", sub_title: "ปีกจอมลุย ทะลวงริมเส้นสุดดุดัน", glow_color: "from-red-600 to-red-900", stats: { speed: 89, shooting: 84, passing: 82, stamina: 86, tackle: 50 }, analysis: "ริมเส้นที่ตัดเข้าในมาทำประตูหรือสร้างโอกาสให้เพื่อนร่วมทีมได้อย่างเด็ดขาดและสม่ำเสมอ", match_stats: { rating: "7.42", apps: "31", goals: "14", assists: "7" } },
  { team: 'Manchester United', player_name: "Benjamin Sesko", image: "/players/sesko.png", class_name: "The Modern Target Man", sub_title: "ศูนย์หน้าเพชฌฆาต รูปร่างสูงใหญ่แต่รวดเร็ว", glow_color: "from-red-600 to-red-900", stats: { shooting: 88, speed: 86, stamina: 82, passing: 74, tackle: 45 }, analysis: "ศูนย์หน้าตัวเป้าที่จบสกอร์เฉียบคม มีความเร็วและลูกกลางอากาศที่อันตรายมาก", match_stats: { rating: "7.48", apps: "29", goals: "19", assists: "3" } },
  { team: 'Manchester United', player_name: "Matheus Cunha", image: "/players/cunha.png", class_name: "The Dynamic Forward", sub_title: "ตัวรุกสารพัดประโยชน์ ทักษะแซมบ้าแพรวพราว", glow_color: "from-red-600 to-red-900", stats: { passing: 84, shooting: 82, speed: 85, stamina: 88, tackle: 55 }, analysis: "เชื่อมเกมรุกได้ไหลลื่น ขยันวิ่งเพรสซิ่ง และสร้างความปั่นป่วนให้กองหลังได้ตลอดเวลา", match_stats: { rating: "7.31", apps: "30", goals: "11", assists: "8" } },
  

  // 🔵 Manchester City 
  { team: 'Manchester City', player_name: "Erling Haaland", image: "/players/haaland.png", class_name: "The Complete Target Man", sub_title: "จอมมารบลู จักรกลถล่มประตูแห่งยุค", glow_color: "from-sky-400 to-blue-700", stats: { shooting: 98, speed: 90, stamina: 85, passing: 70, tackle: 40 }, analysis: "แข็งแกร่ง รวดเร็ว และจบสกอร์คมกริบ เป็นฝันร้ายของกองหลังทุกทีม", match_stats: { rating: "7.95", apps: "33", goals: "36", assists: "5" } },
  { team: 'Manchester City', player_name: "Phil Foden", image: "/players/foden.png", class_name: "The Roaming Playmaker", sub_title: "ผู้เล่นยอดเยี่ยม ตัวความหวังเบอร์หนึ่ง", glow_color: "from-sky-400 to-blue-700", stats: { passing: 92, speed: 88, shooting: 90, stamina: 88, tackle: 55 }, analysis: "ยกระดับตัวเองขึ้นมาเป็นเดอะแบกของทีม สอดเข้าไปยิงแถวสองได้เฉียบขาดมาก", match_stats: { rating: "7.78", apps: "34", goals: "18", assists: "11" } },
  { team: 'Manchester City', player_name: "Josko Gvardiol", image: "/players/gvardiol.png", class_name: "The Attacking Defender", sub_title: "กองหลังจอมบุก เติมเกมรุกดั่งปีกซ้าย", glow_color: "from-sky-400 to-blue-700", stats: { tackle: 88, intercept: 86, passing: 85, shooting: 80, speed: 82 }, analysis: "ไม่ใช่แค่เกมรับที่แน่นหนา แต่การเติมขึ้นมาสับไกยิงหน้ากรอบเขตโทษคืออาวุธลับ", match_stats: { rating: "7.40", apps: "31", goals: "6", assists: "4" } },
  { team: 'Manchester City', player_name: "Savinho", image: "/players/savinho.png", class_name: "The Electric Winger", sub_title: "ปีกตัวจี๊ดคนใหม่ เลี้ยงกินตัวสุดเร้าใจ", glow_color: "from-sky-400 to-blue-700", stats: { speed: 94, passing: 82, shooting: 78, stamina: 85, tackle: 40 }, analysis: "เพิ่มมิติเกมรุกริมเส้นด้วยทักษะการดวล 1-1 ที่คู่แข่งจับทางยาก", match_stats: { rating: "7.28", apps: "25", goals: "7", assists: "9" } },
  { team: 'Manchester City', player_name: "Rodri", image: "/players/rodri.png", class_name: "The Anchor Man", sub_title: "เสาหลักแดนกลาง สมดุลแห่งทัพเรือใบ", glow_color: "from-sky-400 to-blue-700", stats: { passing: 94, tackle: 90, intercept: 92, stamina: 92, shooting: 85 }, analysis: "ตัวรับที่สมบูรณ์แบบที่สุด คุมจังหวะเกม ตัดเกมเนียน และยิงไกลแถวสองได้เด็ดขาด", match_stats: { rating: "8.12", apps: "32", goals: "8", assists: "8" } },

  // 🔴 Bayern Munich 
  { team: 'Bayern Munich', player_name: "Harry Kane", image: "/players/kane.png", class_name: "The Modern Apex Predator", sub_title: "ยอดเพชฌฆาตจอมถล่มประตู ผู้แบกความหวัง", glow_color: "from-red-500 to-red-800", stats: { shooting: 96, passing: 88, stamina: 85, intercept: 45, speed: 70 }, analysis: "เครื่องจักรผลิตประตูที่ถอยลงมาเชื่อมเกม สร้างสรรค์โอกาสให้เพื่อนได้สมบูรณ์แบบ", match_stats: { rating: "7.88", apps: "32", goals: "34", assists: "9" } },
  { team: 'Bayern Munich', player_name: "Michael Olise", image: "/players/olise.png", class_name: "The Creative Winger", sub_title: "ปีกจอมทัพคนใหม่ อาวุธหนักริมเส้นฝั่งขวา", glow_color: "from-red-500 to-red-800", stats: { speed: 88, passing: 90, shooting: 85, stamina: 82, tackle: 50 }, analysis: "มีเท้าซ้ายที่ชั่งทอง ทั้งการเปิดบอลสุดแม่นยำและการตัดเข้าในเพื่อปั่นโค้งๆ", match_stats: { rating: "7.52", apps: "28", goals: "11", assists: "12" } },
  { team: 'Bayern Munich', player_name: "Jamal Musiala", image: "/players/musiala.png", class_name: "The Dribbling Wizard", sub_title: "พ่อมดน้อยแห่งมิวนิค เลี้ยงบอลติดเท้าดั่งเวทมนตร์", glow_color: "from-red-500 to-red-800", stats: { speed: 90, passing: 88, shooting: 85, stamina: 85, tackle: 45 }, analysis: "ทำลายแผงรับฝั่งตรงข้ามด้วยการเลี้ยงกินตัวในพื้นที่แคบๆ พลิกวิกฤตให้เป็นโอกาสได้เสมอ", match_stats: { rating: "7.75", apps: "30", goals: "14", assists: "10" } },
  { team: 'Bayern Munich', player_name: "Joshua Kimmich", image: "https://ui-avatars.com/api/?name=Joshua+Kimmich&background=991b1b&color=fff&size=256&font-size=0.33", class_name: "The Deep-Lying Playmaker", sub_title: "จอมทัพมันสมองระดับเวิลด์คลาสของเสือใต้", glow_color: "from-red-500 to-red-800", stats: { passing: 94, intercept: 88, tackle: 85, stamina: 92, speed: 74 }, analysis: "การอ่านเกมที่ยอดเยี่ยมและวิสัยทัศน์การจ่ายบอลยาวจากแนวลึก คือหัวใจหลักในการคุมจังหวะเกมรุกและรับของทีม", match_stats: { rating: "7.64", apps: "33", goals: "4", assists: "14" } },
  { team: 'Bayern Munich', player_name: "Aleksandar Pavlovic", image: "/players/pavlovic.png", class_name: "The Midfield Metronome", sub_title: "ดาวรุ่งลูกหม้อ ตัวคุมจังหวะยุคใหม่", glow_color: "from-red-500 to-red-800", stats: { passing: 88, tackle: 80, intercept: 82, stamina: 86, speed: 75 }, analysis: "จ่ายบอลฉลาด แกะเพรสซิ่งนิ่งเกินวัย ก้าวขึ้นมาเป็นกำลังหลักในแดนกลางอย่างเต็มตัว", match_stats: { rating: "7.22", apps: "28", goals: "2", assists: "4" } },

  // 🔴 Liverpool 
  { team: 'Liverpool', player_name: "Mohamed Salah", image: "/players/salah.png", class_name: "The Inside Forward", sub_title: "ฟาโรห์แห่งแอนฟิลด์ ราชาปีกขวาตลอดกาล", glow_color: "from-red-600 to-rose-900", stats: { shooting: 92, speed: 90, passing: 86, stamina: 88, tackle: 45 }, analysis: "ความเฉียบคมในการจบสกอร์และการสร้างโอกาสให้เพื่อนยังคงอันตรายที่สุดในลีก", match_stats: { rating: "7.82", apps: "32", goals: "22", assists: "13" } },
  { team: 'Liverpool', player_name: "Federico Chiesa", image: "/players/chiesa.png", class_name: "The Dynamic Forward", sub_title: "แนวรุกอิตาเลียน เติมความจี๊ดจ๊าดริมเส้น", glow_color: "from-red-600 to-rose-900", stats: { speed: 92, shooting: 84, passing: 80, stamina: 85, tackle: 50 }, analysis: "ขยันวิ่งไล่บอล มีความเร็วและความมุ่งมั่นสูง ช่วยสร้างมิติใหม่ๆ ในแดนหน้า", match_stats: { rating: "7.15", apps: "28", goals: "6", assists: "5" } },
  { team: 'Liverpool', player_name: "Dominik Szoboszlai", image: "/players/szoboszlai.png", class_name: "The Box-to-Box Engine", sub_title: "ไดนาโมแดนกลาง พลังงานล้นเหลือ", glow_color: "from-red-600 to-rose-900", stats: { passing: 88, shooting: 86, speed: 85, stamina: 94, tackle: 75 }, analysis: "วิ่งไม่มีหมดทั้งเกมรุกและรับ มีทีเด็ดจากการส่องไกลนอกกรอบที่ทรงพลัง", match_stats: { rating: "7.38", apps: "31", goals: "7", assists: "8" } },
  { team: 'Liverpool', player_name: "Virgil van Dijk", image: "/players/vandijk.png", class_name: "The Colossus Defender", sub_title: "กำแพงเหล็กดัตช์ กัปตันทีมไร้พ่ายดวล 1-1", glow_color: "from-red-600 to-rose-900", stats: { tackle: 94, intercept: 92, passing: 86, speed: 78, stamina: 85 }, analysis: "บัญชาการเกมรับได้อย่างหมดจด อ่านเกมขาด และเป็นศูนย์รวมจิตใจของทีม", match_stats: { rating: "7.65", apps: "34", goals: "4", assists: "2" } },
  { team: 'Liverpool', player_name: "Florian Wirtz", image: "/players/wirtz.png", class_name: "The Generational Playmaker", sub_title: "จอมทัพอัจฉริยะคนใหม่ เป้าหมายเบอร์หนึ่งของหงส์แดง", glow_color: "from-red-600 to-rose-900", stats: { passing: 94, shooting: 86, speed: 85, stamina: 84, tackle: 48 }, analysis: "วิสัยทัศน์การจ่ายบอลทะลุช่องที่เฉียบคมและการเอาตัวรอดในพื้นที่แคบ จะยกระดับเกมรุกของลิเวอร์พูลสู่มิติใหม่", match_stats: { rating: "7.91", apps: "32", goals: "15", assists: "16" } },

  // 🔴 Arsenal 
  { team: 'Arsenal', player_name: "Bukayo Saka", image: "/players/saka.png", class_name: "The Pacey Winger", sub_title: "สตาร์บอยริมเส้นขวา แบกเกมรุกปืนใหญ่", glow_color: "from-red-500 to-orange-700", stats: { speed: 90, shooting: 86, passing: 86, stamina: 90, tackle: 55 }, analysis: "รักษาฟอร์มได้สม่ำเสมอ เลี้ยงกินตัวฉลาด และมีการตัดสินใจจังหวะสุดท้ายที่เฉียบขาด", match_stats: { rating: "7.85", apps: "33", goals: "16", assists: "14" } },
  { team: 'Arsenal', player_name: "Martin Odegaard", image: "/players/odegaard.png", class_name: "The Advanced Playmaker", sub_title: "กัปตันมาติน มันสมองและวิสัยทัศน์ระดับท็อป", glow_color: "from-red-500 to-orange-700", stats: { passing: 94, shooting: 84, stamina: 92, intercept: 65, tackle: 60 }, analysis: "คีย์แมนในการขับเคลื่อนเกมบุก เป็นคนจ่ายบอลจังหวะชี้เป็นชี้ตายให้ทีมเสมอ", match_stats: { rating: "7.72", apps: "32", goals: "9", assists: "12" } },
  { team: 'Arsenal', player_name: "Riccardo Calafiori", image: "/players/calafiori.png", class_name: "The Versatile Wall", sub_title: "ปราการหลังอิตาเลียน ดุดันและไป com-รุกดี", glow_color: "from-red-500 to-orange-700", stats: { tackle: 88, intercept: 86, passing: 84, speed: 82, stamina: 85 }, analysis: "เล่นได้ทั้งเซ็นเตอร์และแบ็คซ้าย แข็งแกร่งในการปะทะ และกล้าพาบอลลุยขึ้นหน้า", match_stats: { rating: "7.32", apps: "27", goals: "3", assists: "4" } },
  { team: 'Arsenal', player_name: "Declan Rice", image: "/players/rice.png", class_name: "The Box-to-Box Destroyer", sub_title: "มิดฟิลด์ตัวกลั่น ปัดกวาดและขับเคลื่อน", glow_color: "from-red-500 to-orange-700", stats: { tackle: 92, intercept: 90, passing: 88, stamina: 95, speed: 78 }, analysis: "คุมแดนกลางเบ็ดเสร็จ ตัดเกมเด็ดขาด และมีทีเด็ดในการโหม่งทำประตูจากลูกเซ็ตพีซ", match_stats: { rating: "7.58", apps: "34", goals: "6", assists: "7" } },
  { team: 'Arsenal', player_name: "William Saliba", image: "/players/saliba.png", class_name: "The Rolls-Royce Defender", sub_title: "ปราการหลังเชิงสูง นิ่ง เยือกเย็น ดุดัน", glow_color: "from-red-500 to-orange-700", stats: { tackle: 90, intercept: 88, speed: 85, passing: 84, stamina: 86 }, analysis: "รับมือกับกองหน้าที่มีความเร็วได้สบาย เก็บกวาดเรียบ และตั้งเกมจากแดนหลังได้เนียนตา", match_stats: { rating: "7.60", apps: "35", goals: "2", assists: "1" } },
];

// 📐 โครงสร้างพิกัดแผนผังสนาม แยกตามฟอร์เมชันการเล่นแบบสัมพัทธ์ %
const tacticalFormations = {
  '4-3-3': [
    { id: 0, role: 'ST', top: '14%', left: '50%' },
    { id: 1, role: 'LW', top: '22%', left: '20%' },
    { id: 2, role: 'RW', top: '22%', left: '80%' },
    { id: 3, role: 'LCM', top: '46%', left: '28%' },
    { id: 4, role: 'CM', top: '56%', left: '50%' },
    { id: 5, role: 'RCM', top: '46%', left: '72%' },
    { id: 6, role: 'LB', top: '75%', left: '15%' },
    { id: 7, role: 'LCB', top: '78%', left: '38%' },
    { id: 8, role: 'RCB', top: '78%', left: '62%' },
    { id: 9, role: 'RB', top: '75%', left: '85%' },
    { id: 10, role: 'GK', top: '91%', left: '50%' }
  ],
  '4-2-3-1': [
    { id: 0, role: 'ST', top: '12%', left: '50%' },
    { id: 1, role: 'LM', top: '32%', left: '18%' },
    { id: 2, role: 'AM', top: '35%', left: '50%' },
    { id: 3, role: 'RM', top: '32%', left: '82%' },
    { id: 4, role: 'LDM', top: '58%', left: '34%' },
    { id: 5, role: 'RDM', top: '58%', left: '66%' },
    { id: 6, role: 'LB', top: '75%', left: '15%' },
    { id: 7, role: 'LCB', top: '78%', left: '38%' },
    { id: 8, role: 'RCB', top: '78%', left: '62%' },
    { id: 9, role: 'RB', top: '75%', left: '85%' },
    { id: 10, role: 'GK', top: '91%', left: '50%' }
  ]
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('news');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNewsTeam, setSelectedNewsTeam] = useState('All');
  const [activeAnalysis, setActiveAnalysis] = useState({}); 
  const [selectedDnaTeam, setSelectedDnaTeam] = useState('Manchester United');
  
  // 🕸️ State สำหรับเก็บโหมดการแสดงผลสถิติของการ์ดแต่ละใบ (bars หรือ radar)
  const [cardViewModes, setCardViewModes] = useState({});

  // ⚔️ State สำหรับเก็บข้อมูลนักเตะประลองชนสถิติคู่ตัวต่อตัว
  const [compareList, setCompareList] = useState([]);
  const [showDuelModal, setShowDuelModal] = useState(false);

  // 📋 ระบบบอร์ดจัดทีมสควอดด้วย Drag & Drop และการคลิกส่งลงสนาม
  const [activeFormation, setActiveFormation] = useState('4-3-3');
  const [lineup, setLineup] = useState({}); 
  const [builderSquadFilter, setBuilderSquadFilter] = useState('All');

  const toggleAnalysis = (index) => {
    setActiveAnalysis(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleCardViewMode = (playerName) => {
    setCardViewModes(prev => ({
      ...prev,
      [playerName]: prev[playerName] === 'radar' ? 'bars' : 'radar'
    }));
  };

  // ⚔️ ฟังก์ชันคุมระบบคิว เพิ่ม-ลบรายชื่อนักเตะที่จะเอามาชนสถิติดวลกัน
  const handleCompareToggle = (player) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.player_name === player.player_name);
      if (exists) {
        return prev.filter(p => p.player_name !== player.player_name);
      }
      if (prev.length >= 2) {
        return [prev[1], player]; 
      }
      return [...prev, player];
    });
  };

  // 📋 [🚀 อัปเกรด DRAG START LOGIC]: คุมท่อบันทึก ID สล็อตต้นทางของการลาก (ถ้าลากจากในสนามจะดักจับไว้ได้)
  const handleDragStart = (e, player, sourceSlotId = null) => {
    e.dataTransfer.setData("text/plain", player.player_name);
    if (sourceSlotId !== null) {
      e.dataTransfer.setData("sourceSlotId", sourceSlotId.toString());
    } else {
      e.dataTransfer.setData("sourceSlotId", "pool");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  // 📋 [🚀 อัปเกรด DROP SWAP LOGIC]: ลอจิกสับไพ่สลับตำแหน่งนักเตะกันเองบนผืนหญ้าจำลองอย่างสมบูรณ์แบบ
  const handleDropOnSlot = (e, slotId) => {
    e.preventDefault();
    const playerName = e.dataTransfer.getData("text/plain");
    const sourceSlotIdStr = e.dataTransfer.getData("sourceSlotId");
    const player = squadDatabase.find(p => p.player_name === playerName);
    if (!player) return;

    setLineup(prev => {
      const updated = { ...prev };
      
      // กรณีที่ 1: ลากนักเตะข้ามช่อง ย้ายตำแหน่งกันเองภายในแผนการเล่น (Intra-field Drag & Swap)
      if (sourceSlotIdStr && sourceSlotIdStr !== "pool") {
        const sourceSlotId = parseInt(sourceSlotIdStr);
        const existingTargetPlayer = updated[slotId];
        
        if (existingTargetPlayer) {
          // 🔁 SWAP: สล็อตเป้าหมายมีคนยืนอยู่แล้ว ให้ส่งคนเดิมกลับไปยืนสล็อตเก่าของคนลาก
          updated[sourceSlotId] = existingTargetPlayer;
        } else {
          // 🚚 MOVE: ช่องว่างเปล่า ให้ลบคนลากพ้นจากช่องเก่าไปเลย
          delete updated[sourceSlotId];
        }
        updated[slotId] = player;
      } else {
        // กรณีที่ 2: ลากข้อมูลเข้ามาใหม่จาก Pool แถบ Sidebar ข้างนอกสนาม
        Object.keys(updated).forEach(key => {
          if (updated[key]?.player_name === player.player_name) {
            delete updated[key];
          }
        });
        updated[slotId] = player;
      }
      return updated;
    });
  };

  // 📱 Mobile Fallback: กดคลิกปุ่มส่งเข้าช่องว่างอัตโนมัติเมื่อเล่นบนมือถือ
  const handleAddPlayerToFirstEmptySlot = (player) => {
    const isPresent = Object.values(lineup).some(p => p && p.player_name === player.player_name);
    if (isPresent) return;

    const currentSlots = tacticalFormations[activeFormation];
    for (let slot of currentSlots) {
      if (!lineup[slot.id]) {
        setLineup(prev => ({ ...prev, [slot.id]: player }));
        break;
      }
    }
  };

  const handleRemovePlayerFromSlot = (slotId) => {
    setLineup(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  useEffect(() => {
    // 🌐 เรียกใช้ตัวแปรโปรดักชัน เพื่อความเสถียรเมื่อ Deploy ขึ้นคลาวด์จริง
    fetch(`${API_BASE_URL}/api/news`)
      .then((res) => res.json())
      .then((response) => {
        if (response.status === 'success' && response.data) {
          setNews(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ หน้าบ้านดึงข้อมูลพลาด:', err);
        setLoading(false);
      });
  }, []);

  const filteredNews = news.filter(item => {
    const matchesTeam = selectedNewsTeam === 'All' || (item.teams && item.teams.includes(selectedNewsTeam));
    const matchesSearch = searchQuery.trim() === '' || 
      (item.title_en && item.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary_th && item.summary_th.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTeam && matchesSearch;
  });

  const squadToDisplay = squadDatabase.filter(player => player.team === selectedDnaTeam);

  // 🧮 สมการประมวลผลคำนวณสถิติเฉลี่ยรวมทีมอัตโนมัติบนกระดานสนามหญ้า
  const activePlayersInField = Object.values(lineup).filter(Boolean);
  const totalFieldPlayers = activePlayersInField.length;

  const teamSynergyMetrics = {
    rating: totalFieldPlayers ? (activePlayersInField.reduce((acc, p) => acc + parseFloat(p.match_stats?.rating || 7.0), 0) / totalFieldPlayers).toFixed(2) : "0.00",
    passing: totalFieldPlayers ? Math.round(activePlayersInField.reduce((acc, p) => acc + (p.stats?.passing || 50), 0) / totalFieldPlayers) : 0,
    defense: totalFieldPlayers ? Math.round(activePlayersInField.reduce((acc, p) => acc + (((p.stats?.tackle || 50) + (p.stats?.intercept || 45)) / 2), 0) / totalFieldPlayers) : 0,
    speed: totalFieldPlayers ? Math.round(activePlayersInField.reduce((acc, p) => acc + (p.stats?.speed || 50), 0) / totalFieldPlayers) : 0
  };

  // 🧮 ฟังก์ชันคณิตศาสตร์เรนเดอร์กราฟใยแมงมุมความละเอียดสูงด้วยพิกัด SVG
  const renderRadarChart = (stats, glowColor) => {
    const entries = Object.entries(stats);
    const center = 75; 
    const maxRadius = 50; 
    
    const getCoordinates = (index, value) => {
      const angle = (index * (2 * Math.PI) / 5) - (Math.PI / 2);
      const radius = maxRadius * (value / 100);
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };

    const levels = [0.25, 0.5, 0.75, 1.0]; 
    const isRed = glowColor.includes('red') || glowColor.includes('rose');
    const strokeColor = isRed ? '#f43f5e' : '#38bdf8';
    const fillColor = isRed ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.25)';

    return (
      <div className="w-full flex items-center justify-center bg-slate-950/40 p-2 border border-white/5 rounded-2xl shadow-inner mt-2">
        <svg viewBox="0 0 150 150" className="w-full h-34 drop-shadow-[0_0_6px_rgba(255,255,255,0.05)]">
          {levels.map((level, lIdx) => {
            const points = entries.map((_, i) => {
              const { x, y } = getCoordinates(i, level * 100);
              return `${x},${y}`;
            }).join(' ');
            return <polygon key={lIdx} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />;
          })}

          {entries.map((_, i) => {
            const outer = getCoordinates(i, 100);
            return <line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" strokeDasharray="1,2" />;
          })}

          <polygon 
            points={entries.map(([_, val], i) => { const { x, y } = getCoordinates(i, val); return `${x},${y}`; }).join(' ')} 
            fill={fillColor} 
            stroke={strokeColor} 
            strokeWidth="1.5" 
            className="animate-pulse"
          />

          {entries.map(([statName, statValue], i) => {
            const textPos = getCoordinates(i, 126); 
            return (
              <text 
                key={statName} 
                x={textPos.x} 
                y={textPos.y} 
                textAnchor="middle" 
                alignmentBaseline="middle" 
                className="text-[8px] font-black fill-slate-400 uppercase tracking-tighter"
              >
                {statName.substring(0, 4)}:{statValue}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b1528] via-[#020617] to-[#000000] text-slate-100 font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative pb-12">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* 🔮 เอฟเฟกต์ Fade หน้าจอ */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <header className="border-b border-blue-500/15 bg-[#080d24]/80 backdrop-blur-2xl sticky top-0 z-50 px-6 py-5 max-w-7xl mx-auto rounded-b-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.25)] flex items-center justify-center">
              <Trophy className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-normal tracking-wider uppercase text-white leading-none drop-shadow-[0_2px_10px_rgba(30,144,255,0.4)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Tier1 Football
              </h1>
              <p className="text-[9px] uppercase tracking-[0.45em] text-blue-400 font-black mt-1">Verified Transfer Intelligence</p>
            </div>
          </div>

          {/* 📋 ปุ่มเมนูบอร์ดแถบนำทางอัปเกรด 3 แท็บครบเซ็ตระดับโปรเจกต์ส่งพอร์ต */}
          <div className="flex bg-[#030712]/80 p-1.5 rounded-2xl border border-white/5 shadow-inner gap-1 flex-wrap justify-center">
            <button 
              onClick={() => setCurrentPage('news')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                currentPage === 'news' 
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'text-slate-500 hover:text-slate-300 transparent border border-transparent'
              }`}
            >
              <Newspaper className="w-4 h-4" /> News Feed
            </button>
            <button 
              onClick={() => setCurrentPage('database')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                currentPage === 'database' 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'text-slate-500 hover:text-slate-300 transparent border border-transparent'
              }`}
            >
              <Database className="w-4 h-4" /> Player DNA
            </button>
            <button 
              onClick={() => setCurrentPage('builder')}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                currentPage === 'builder' 
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'text-slate-500 hover:text-slate-300 transparent border border-transparent'
              }`}
            >
              <Zap className="w-4 h-4" /> Squad Builder ⚡
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4 relative z-10">

        {/* ============================================================================== */}
        {/* หน้า 1: NEWS FEED */}
        {/* ============================================================================== */}
        {currentPage === 'news' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#080f28]/50 backdrop-blur-xl border border-white/[0.04] p-4 rounded-3xl">
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
                {['All', 'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester City', 'Bayern Munich'].map((team) => (
                  <button
                    key={team}
                    onClick={() => setSelectedNewsTeam(team)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap border ${
                      selectedNewsTeam === team 
                        ? 'bg-blue-600/20 text-blue-200 border-blue-500/50 shadow-inner' 
                        : 'bg-[#030712]/60 border-white/5 text-slate-400 hover:border-blue-500/30'
                    }`}
                  >
                    {team === 'All' ? '🌐 All Teams' : team}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="ค้นหาข่าว..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#030712]/70 border border-blue-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                />
                {searchQuery && (
                  <X className="w-4 h-4 absolute right-3 top-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
                )}
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2 pl-2">
              <Newspaper className="w-4 h-4 text-blue-400" /> Transfer News Updates
            </h2>

            {loading ? (
              <div className="text-center py-20 text-blue-400 text-sm animate-pulse">กำลังโหลดข้อมูลข่าว...</div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm">📭 ไม่พบข่าวที่ค้นหา</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredNews.map((item, index) => (
                  <div key={index} className="bg-[#0c1426]/50 backdrop-blur-xl border border-white/[0.04] hover:border-blue-500/40 rounded-3xl p-5 transition-all space-y-4">
                    <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#030712] relative">
                      <img src={item.news_image} alt="news" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold uppercase bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20">{item.source}</span>
                    </div>
                    
                    <h3 className="text-slate-400 text-xs pl-2 border-l-2 border-blue-500/30">ENG: {item.title_en}</h3>
                    
                    <p className="text-[#f1f5f9] text-sm leading-relaxed bg-[#020617]/50 p-3 rounded-xl border border-white/[0.02]">
                      {item.summary_th}
                    </p>
                    
                    <div className="border-t border-white/5 pt-3">
                      <button onClick={() => toggleAnalysis(index)} className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-[#0f172a]/40 border border-white/5 hover:border-blue-500/30">
                        <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> <span>FM Tactical Analysis</span></div>
                      </button>
                      {activeAnalysis[index] && (
                        <div className="mt-3 bg-[#030712]/90 border border-white/5 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-blue-400">Tactical Fit</span><span className="text-blue-300 font-bold">{item.tactical_fit?.score}%</span></div>
                          <div className="flex justify-between border-t border-white/5 pt-2"><span className="text-amber-400">Financial</span><span className="text-amber-300 font-bold">{item.financial_impact?.score}%</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* หน้า 2: PLAYER DNA DATABASE */}
        {/* ============================================================================== */}
        {currentPage === 'database' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-[#080f28]/50 backdrop-blur-2xl border border-white/[0.04] p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-[0.15em]">Select Squad Database</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-900/50 scrollbar-track-transparent">
                {['Manchester United', 'Liverpool', 'Arsenal', 'Manchester City', 'Bayern Munich'].map((team) => (
                  <button
                    key={team}
                    onClick={() => setSelectedDnaTeam(team)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all whitespace-nowrap border ${
                      selectedDnaTeam === team 
                        ? 'bg-emerald-600/20 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                        : 'bg-[#030712]/60 border-white/5 text-slate-400 hover:border-emerald-500/30'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-2 pl-2">
              <Database className="w-4 h-4" /> {selectedDnaTeam} - Core Squad DNA
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {squadToDisplay.map((player, index) => {
                const currentMode = cardViewModes[player.player_name] || 'bars';
                const isSelectedForCompare = compareList.some(p => p.player_name === player.player_name);

                return (
                  <div key={index} className={`bg-gradient-to-br ${player.glow_color} p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl hover:scale-[1.01] transition-transform group`}>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-0"></div>
                    
                    {/* ✨ เอฟเฟกต์การ์ดฟอยล์สะท้อนแสง วิ่งเฉียงตัดผ่านตัวการ์ดเมื่อเอาเมาส์มาวาง */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-30" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                      
                      {/* ส่วนบน: ข้อมูลชื่อนักเตะ, ป้าย Class, แผงสถิติมินิ และรูปภาพโมเดล */}
                      <div className="flex justify-between items-start gap-4">
                        {/* ข้อมูลฝั่งซ้าย */}
                        <div className="space-y-3 flex-1 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">AI PLAYER MATRIX DECODED</span>
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-black tracking-wider uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)] leading-tight">
                            {player.player_name}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-200 font-black text-[10px] tracking-wide px-3 py-1.5 rounded-lg uppercase shadow-inner">
                            ⚡ Class: {player.class_name}
                          </div>

                          {/* แผงแดชบอร์ดสถิติล่าสุดและเรตติ้งคะแนนเฉลี่ยฤดูกาลปัจจุบัน */}
                          {player.match_stats && (
                            <div className="flex items-center gap-2 pt-1 max-w-[90%] sm:max-w-full">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-center min-w-[55px] shadow-sm shadow-emerald-500/5">
                                <div className="text-[8px] uppercase font-bold text-emerald-400 tracking-wider">Rating</div>
                                <div className="text-sm font-black text-emerald-300 font-mono leading-tight">{player.match_stats.rating}</div>
                              </div>
                              <div className="bg-white/[0.03] border border-white/5 px-2 py-1 rounded-xl text-center min-w-[45px]">
                                <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Apps</div>
                                <div className="text-xs font-black text-slate-200 font-mono leading-tight">{player.match_stats.apps}</div>
                              </div>
                              <div className="bg-white/[0.03] border border-white/5 px-2 py-1 rounded-xl text-center min-w-[45px]">
                                <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Goals</div>
                                <div className="text-xs font-black text-slate-200 font-mono leading-tight">{player.match_stats.goals}</div>
                              </div>
                              <div className="bg-white/[0.03] border border-white/5 px-2 py-1 rounded-xl text-center min-w-[45px]">
                                <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Asst</div>
                                <div className="text-xs font-black text-slate-200 font-mono leading-tight">{player.match_stats.assists}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 🖼️ รูปนักเตะแกน Y ดิ่งพ้นระยะการโดนบัง */}
                        <div className="shrink-0 relative flex justify-center items-end w-36 sm:w-48 md:w-56 h-48 sm:h-60 md:h-72 -translate-y-8 sm:-translate-y-12 md:-translate-y-14">
                          
                          {/* ✨ เอฟเฟกต์แสงออร่าด้านหลัง */}
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 bg-gradient-to-tr ${player.glow_color} rounded-full blur-[50px] opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500`}></div>
                          
                          {/* 🧍‍♂️ รูปนักเตะ */}
                          <img 
                            src={player.image} 
                            alt={player.player_name} 
                            className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-500 origin-bottom"
                          />
                          
                        </div>
                      </div>

                      {/* คำบรรยายและบทวิเคราะห์ */}
                      <div className="space-y-2 mt-2">
                        <p className="text-sm text-emerald-400 font-bold tracking-wide">🔥 {player.sub_title}</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/5">" {player.analysis} "</p>
                      </div>

                      {/* 🛠️ ส่วนหัวแถบค่าพลัง + ปุ่มสลับโหมด และปุ่มเลือกดวลเปรียบเทียบ */}
                      <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/10 flex-wrap">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Technical Attributes</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCompareToggle(player)}
                            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all border shadow-sm ${
                              isSelectedForCompare
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            ⚔️ {isSelectedForCompare ? 'Locked' : 'Duel Compare'}
                          </button>

                          <button 
                            onClick={() => toggleCardViewMode(player.player_name)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all shadow-inner"
                          >
                            <BarChart2 className="w-3 h-3" />
                            <span>Mode: {currentMode === 'bars' ? 'Bars 📊' : 'Radar 🕸️'}</span>
                          </button>
                        </div>
                      </div>

                      {/* ⚡ แสดงผลหลอดพลังงานตามโหมดที่เลือก */}
                      {currentMode === 'bars' ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {Object.entries(player.stats).map(([statName, statValue]) => (
                            <div key={statName} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-300">
                                <span>{statName}</span>
                                <span className="text-white bg-white/10 px-1.5 rounded">{statValue}</span>
                              </div>
                              <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className={`bg-gradient-to-r ${player.glow_color} h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.25)]`}
                                  style={{ width: `${statValue}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        renderRadarChart(player.stats, player.glow_color)
                      )}
                      
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ============================================================================== */}
        {/* หน้าใหม่ 3 [SQUAD BUILDER]: บอร์ดจำลองผืนสนามฟุตบอลลากวางด้วย NATIVE DRAG & DROP HUB */}
        {/* ============================================================================== */}
        {currentPage === 'builder' && (
          <div className="space-y-6 animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* ฝั่งซ้าย 2 คอลัมน์: ผืนสนามฟุตบอลสีเขียวนีออนเรืองแสงเรนเดอร์สล็อต */}
            <div className="lg:col-span-2 bg-[#05140e] border border-emerald-500/30 rounded-3xl p-4 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              
              {/* ส่วนควบคุมด้านบนสนาม: สลับแท็กติก และ แดชบอร์ดสรุปสถิติเฉลี่ยพลังทีมแบบ Dynamic */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-black/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl mb-4 gap-4 relative z-20">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Formations:</span>
                  {['4-3-3', '4-2-3-1'].map(form => (
                    <button
                      key={form}
                      onClick={() => {
                        setActiveFormation(form);
                        setLineup({}); // รีเซ็ตข้อมูลกระดานชั่วคราวเพื่อให้คำนวณตำแหน่งใหม่สอดคล้องกัน
                      }}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                        activeFormation === form
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {form}
                    </button>
                  ))}
                </div>

                {/* ดึงผลการรวมสถิติเฉลี่ยจากฟังก์ชันคณิตศาสตร์มาโชว์ของ */}
                <div className="flex items-center gap-4 font-mono">
                  <div className="text-center">
                    <div className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold">TEAM OVR</div>
                    <div className="text-base font-black text-white">{teamSynergyMetrics.rating}</div>
                  </div>
                  <div className="text-center border-l border-white/10 pl-3">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">PAS</div>
                    <div className="text-xs font-black text-slate-200">{teamSynergyMetrics.passing}</div>
                  </div>
                  <div className="text-center border-l border-white/10 pl-3">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">DEF</div>
                    <div className="text-xs font-black text-slate-200">{teamSynergyMetrics.defense}</div>
                  </div>
                  <div className="text-center border-l border-white/10 pl-3">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">SPD</div>
                    <div className="text-xs font-black text-slate-200">{teamSynergyMetrics.speed}</div>
                  </div>
                </div>
              </div>

              {/* ผืนสนามหญ้าสีเขียวจำลองพิกัดแกนด้วย CSS Perspective */}
              <div className="w-full h-[580px] rounded-2xl bg-gradient-to-b from-emerald-950/70 via-emerald-900/60 to-emerald-950/80 relative border border-emerald-500/20 shadow-inner">
                {/* วาดเส้นสนามฟุตบอล */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500/10 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border border-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/20"></div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-emerald-500/10 rounded-b-xl"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-emerald-500/10 rounded-t-xl"></div>

                {/* 🧍‍♂️ [NATIVE DROP TARGETS]: วนลูปเรนเดอร์ช่องวางสล็อตพิกัดแผนผังสนามที่พร้อมรับการลากวาง */}
                {tacticalFormations[activeFormation].map((slot) => {
                  const player = lineup[slot.id];

                  return (
                    <div
                      key={slot.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnSlot(e, slot.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 select-none group transition-all duration-700 ease-in-out"
                      style={{ top: slot.top, left: slot.left }}
                    >
                      {/* 🖼️ [ขยายขนาดและคุมสลับตัว]: ติดตั้ง draggable และส่งพิกัด ID สล็อตต้นทางเมื่อเริ่มลาก เพื่อให้ระบบสลับตัวทำข้อมูลได้อย่างสมบูรณ์แบบ */}
                      <div 
                        draggable={!!player}
                        onDragStart={(e) => player && handleDragStart(e, player, slot.id)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 bg-slate-950 flex items-center justify-center relative cursor-grab shadow-2xl transition-all ${
                        player 
                          ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] bg-slate-900 active:cursor-grabbing' 
                          : 'border-dashed border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/5'
                      }`}>
                        {player ? (
                          <>
                            {/* แสดงผลรูปภาพโมเดลนักเตะจริงขนาดใหญ่คมชัดบนผืนหญ้า */}
                            <img 
                              src={player.image} 
                              alt={player.player_name} 
                              className="w-full h-full object-cover rounded-full bg-slate-900 pointer-events-none" 
                            />
                            
                            {/* ปุ่มกากบาทถอดถอนผู้เล่นออกจากตำแหน่งด่วน ลอยเด่นเหนือโค้งมุมขวาบน */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePlayerFromSlot(slot.id);
                              }}
                              className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-5 h-5 rounded-full bg-red-600 border border-red-400 text-white flex items-center justify-center text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-black font-mono text-emerald-500/60 group-hover:text-emerald-400">{slot.role}</span>
                        )}
                      </div>

                      {/* ป้ายชื่อกำกับด้านล่างเข็มกลัด */}
                      <div className="bg-slate-950/90 border border-white/5 backdrop-blur-md px-2.5 py-0.5 rounded-md text-center max-w-[110px] shadow-md relative z-10">
                        <div className="text-[10px] sm:text-xs font-black text-slate-100 truncate uppercase tracking-tighter">
                          {player ? player.player_name.split(' ').pop() : slot.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ฝั่งขวา 1 คอลัมน์: คลังสระว่ายน้ำรายชื่อนักเตะสำรองที่เป็นวัตถุดิบในการลาก */}
            <div className="bg-[#0b1224]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-2xl h-[650px] flex flex-col">
              <div className="space-y-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">Drag Player Pool (ลากนักเตะจากตรงนี้)</span>
                </div>
                
                {/* แถบฟิลเตอร์สโมสรด่วน */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Manchester United', 'Liverpool', 'Arsenal', 'Manchester City', 'Bayern Munich'].map(t => (
                    <button
                      key={t}
                      onClick={() => setBuilderSquadFilter(t)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-all border whitespace-nowrap cursor-pointer ${
                        builderSquadFilter === t
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t === 'All' ? '🌐 All' : t.split(' ').pop()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🧍‍♂️ [NATIVE DRAGGABLE POOL]: ตัวแถวรายชื่อนักเตะสำรองที่รองรับการคลิกลากเมาส์สไลด์ไปที่สนาม */}
              <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {squadDatabase
                  .filter(p => builderSquadFilter === 'All' || p.team === builderSquadFilter)
                  .map((player, idx) => {
                    const isInLineup = Object.values(lineup).some(p => p && p.player_name === player.player_name);

                    return (
                      <div 
                        key={idx} 
                        draggable={!isInLineup}
                        onDragStart={(e) => handleDragStart(e, player)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all select-none ${
                          isInLineup 
                            ? 'bg-slate-900/40 border-white/5 opacity-30 cursor-not-allowed' 
                            : 'bg-slate-950/70 border-white/10 hover:border-amber-500/40 cursor-grab active:cursor-grabbing hover:bg-slate-900/60 shadow-md group/row relative overflow-hidden'
                        }`}
                      >
                        {!isInLineup && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-amber-500/40 transform -translate-x-full group-hover/row:translate-x-0 transition-transform" />
                        )}

                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${player.glow_color} p-0.5`}>
                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-mono text-[10px] font-black text-slate-200">
                              {player.match_stats?.rating.substring(0, 3)}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wide leading-none mb-1">{player.player_name}</h4>
                            <p className="text-[9px] text-slate-400 font-medium">{player.team} • 🖐️ ลากหรือกดปุ่มเพิ่ม</p>
                          </div>
                        </div>

                        <button
                          disabled={isInLineup}
                          onClick={() => handleAddPlayerToFirstEmptySlot(player)}
                          className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all border cursor-pointer relative z-20 ${
                            isInLineup
                              ? 'bg-black/20 text-slate-600 border-transparent'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 shadow-sm'
                          }`}
                        >
                          {isInLineup ? 'In Field' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ⚔️ [แท่นล็อกคิวนักเตะลอยได้ - FLOATING COMPARE DOCK]: แสดงผลเมื่อมีการล็อกนักเตะตั้งแต่ 1 คนขึ้นไป */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-2xl border border-emerald-500/30 px-6 py-4 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 max-w-[90vw] sm:max-w-xl animate-slideUp border-t-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Zap className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white leading-none">Scout Matrix Duel</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">เลือกรสถิตินักเตะมาชนกัน ({compareList.length}/2)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 pl-2 pr-3 py-1 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-emerald-400 flex items-center justify-center font-mono font-black text-[9px] text-emerald-400">1</div>
              <span className="text-[11px] font-bold text-slate-200 max-w-[80px] truncate">{compareList[0].player_name}</span>
              <X className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" onClick={() => handleCompareToggle(compareList[0])} />
            </div>

            {compareList.length === 2 ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 pl-2 pr-3 py-1 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-emerald-400 flex items-center justify-center font-mono font-black text-[9px] text-emerald-400">2</div>
                <span className="text-[11px] font-bold text-slate-200 max-w-[80px] truncate">{compareList[1].player_name}</span>
                <X className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" onClick={() => handleCompareToggle(compareList[1])} />
              </div>
            ) : (
              <div className="border border-dashed border-slate-700 text-slate-500 text-[10px] px-4 py-1.5 rounded-xl font-bold tracking-wider uppercase animate-pulse">
                Waiting Slot 2...
              </div>
            )}
          </div>

          {compareList.length === 2 && (
            <button
              onClick={() => setShowDuelModal(true)}
              className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              🚀 Analyze Duel
            </button>
          )}
        </div>
      )}

      {/* ⚔️ [หน้าต่างสกรีนดวลโฮโลแกรมเต็มจอ - HOLOGRAPHIC DUEL MODAL OVERLAY]: โชว์ทักษะสเตจเต็มสูบ */}
      {showDuelModal && compareList.length === 2 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#060c21] border border-emerald-500/30 max-w-4xl w-full rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.2)] p-6 relative flex flex-col gap-6">
            
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* ส่วนหัวปิดหน้าต่าง */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Holographic Squad Duel Matrix
                </h3>
              </div>
              <button 
                onClick={() => setShowDuelModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] shadow-inner"
              >
                <X className="w-3.5 h-3.5" />
                <span>ออกจากหน้านี้ (Close)</span>
              </button>
            </div>

            {/* กระดานข้อมูลผู้เล่นคู่ประลองซ้าย-ขวา */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center relative z-10">
              <div className="md:col-span-3 bg-slate-950/60 p-5 rounded-2xl border border-white/5 text-center space-y-3 relative group overflow-hidden">
                <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${compareList[0].glow_color} rounded-full blur-[45px] opacity-20`} />
                <img src={compareList[0].image} alt={compareList[0].player_name} className="w-28 h-28 object-contain mx-auto drop-shadow-xl" />
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mb-1">{compareList[0].team}</div>
                  <h4 className="text-xl font-black text-white uppercase">{compareList[0].player_name}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300 inline-block mt-1 font-bold">{compareList[0].class_name}</span>
                </div>
                <div className="text-xl font-mono font-black text-emerald-300 bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
                  Rating: {compareList[0].match_stats?.rating || "N/A"}
                </div>
              </div>

              <div className="md:col-span-1 text-center py-2 md:py-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 text-slate-950 flex items-center justify-center font-black mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)] border-2 border-slate-950 text-sm">
                  VS
                </div>
              </div>

              <div className="md:col-span-3 bg-slate-950/60 p-5 rounded-2xl border border-white/5 text-center space-y-3 relative group overflow-hidden">
                <div className={`absolute -left-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${compareList[1].glow_color} rounded-full blur-[45px] opacity-20`} />
                <img src={compareList[1].image} alt={compareList[1].player_name} className="w-28 h-28 object-contain mx-auto drop-shadow-xl" />
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-1">{compareList[1].team}</div>
                  <h4 className="text-xl font-black text-white uppercase">{compareList[1].player_name}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300 inline-block mt-1 font-bold">{compareList[1].class_name}</span>
                </div>
                <div className="text-xl font-mono font-black text-blue-300 bg-blue-500/10 py-1.5 rounded-xl border border-blue-500/20">
                  Rating: {compareList[1].match_stats?.rating || "N/A"}
                </div>
              </div>
            </div>

            {/* บอร์ดวิเคราะห์ตารางหลอดสถิติคู่ขนานแบบประลองสดเปรียบเทียบค่า */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 space-y-4 relative z-10 max-h-[35vh] overflow-y-auto scrollbar-thin">
              <h5 className="text-[10px] font-black tracking-widest text-slate-400 uppercase text-center border-b border-white/5 pb-2">Attribute Side-by-Side Analysis</h5>
              
              {Object.keys({ ...compareList[0].stats, ...compareList[1].stats }).map((statKey) => {
                const val1 = compareList[0].stats[statKey] || 0;
                const val2 = compareList[1].stats[statKey] || 0;
                return (
                  <div key={statKey} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider px-1">
                      <span className={val1 >= val2 ? 'text-emerald-400 font-extrabold shadow-sm' : 'text-slate-400'}>{val1}</span>
                      <span className="text-slate-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">{statKey}</span>
                      <span className={val2 >= val1 ? 'text-blue-400 font-extrabold shadow-sm' : 'text-slate-400'}>{val2}</span>
                    </div>
                    <div className="flex gap-2 items-center h-2.5 w-full">
                      <div className="w-1/2 bg-black/60 h-full rounded-l-full overflow-hidden flex justify-end border border-white/5">
                        <div className="bg-gradient-to-l from-emerald-400 to-emerald-600 h-full rounded-l-full transition-all" style={{ width: `${val1}%` }} />
                      </div>
                      <div className="w-1/2 bg-black/60 h-full rounded-r-full overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-r-full transition-all" style={{ width: `${val2}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* กล่องประมวลผล Synergy ท้ายหน้าจอ */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 rounded-xl border border-emerald-500/20 text-center relative z-10 shadow-lg">
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">AI Tactical Compatibility</div>
              <div className="text-2xl font-black text-white font-mono tracking-wide animate-pulse">
                SYNERGY RATE: 94%
              </div>
            </div>

            {/* 🚪 ปุ่มด้านล่างสุดออกจากหน้าต่างสกรีนดวล เพื่อความสะดวกรวดเร็วในการกดปิด */}
            <div className="flex justify-center pt-2 relative z-10 border-t border-white/5">
              <button
                onClick={() => setShowDuelModal(false)}
                className="px-6 py-2.5 bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
              >
                🚪 ปิดหน้าต่างและกลับสู่คลังนักเตะ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}