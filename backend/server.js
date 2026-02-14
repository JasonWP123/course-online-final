const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Passport config
require('./config/passport')(passport);

const app = express();
const httpServer = createServer(app);

// ============================================
// WEBSOCKET SERVER - AI CHAT (GLOBAL)
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// WebSocket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// AI Response Generator (Rule-based)
function generateAIResponse(userMessage, user) {
  const question = userMessage.toLowerCase();
  
  // Greetings
  if (question.match(/^(halo|hai|hi|hello|hey|pagi|siang|sore|malam)/)) {
    return `Halo ${user?.name || 'Siswa'}! 👋 Ada yang bisa saya bantu seputar pembelajaran?`;
  }
  
  // Thank you
  if (question.includes('terima kasih') || question.includes('makasih') || question.includes('thanks')) {
    return `Sama-sama! 😊 Senang bisa membantu. Ada lagi yang ingin ditanyakan?`;
  }
  
  // Matematika
  if (question.includes('matematika') || question.includes('aljabar') || question.includes('kalkulus') || 
      question.includes('limit') || question.includes('turunan') || question.includes('integral')) {
    
    if (question.includes('aljabar')) {
      return `📚 **Tips Belajar Aljabar:**\n\n1. Kuasai operasi dasar (+, -, ×, ÷)\n2. Pahami konsep variabel dan konstanta\n3. Latihan persamaan linear\n4. Kerjakan soal bertahap dari mudah ke sulit\n\nAda topik aljabar spesifik yang ingin ditanyakan?`;
    }
    if (question.includes('limit')) {
      return `📈 **Konsep Limit Fungsi:**\n\nLimit adalah nilai pendekatan fungsi saat x mendekati nilai tertentu.\n\nRumus dasar: lim x→c f(x) = L\n\nContoh: lim x→2 (x²-4)/(x-2) = 4\n\nAda yang ingin ditanyakan lebih lanjut?`;
    }
    if (question.includes('turunan')) {
      return `📉 **Turunan Fungsi:**\n\nTurunan mengukur laju perubahan fungsi.\n\nAturan dasar:\n• f(x) = xⁿ → f'(x) = n·xⁿ⁻¹\n• f(x) = k → f'(x) = 0\n\nContoh: f(x) = 3x² → f'(x) = 6x\n\nMau latihan soal?`;
    }
    return `Saya bisa membantu Anda belajar Matematika! 📚\n\nTopik yang tersedia:\n✅ Aljabar Dasar\n✅ Persamaan Linear\n✅ Limit Fungsi\n✅ Turunan\n✅ Integral\n\nTopik mana yang ingin dipelajari?`;
  }
  
  // Fisika
  if (question.includes('fisika') || question.includes('gerak') || question.includes('newton') || 
      question.includes('gaya') || question.includes('usaha') || question.includes('energi')) {
    return `⚛️ **Fisika Dasar:**\n\n• Hukum Newton I, II, III\n• Gerak Lurus Beraturan (GLB)\n• Gerak Lurus Berubah Beraturan (GLBB)\n• Usaha dan Energi\n• Momentum dan Impuls\n\nAda materi spesifik yang ingin didiskusikan?`;
  }
  
  // Kimia
  if (question.includes('kimia') || question.includes('stoikiometri') || question.includes('mol') || 
      question.includes('reaksi') || question.includes('ikatan')) {
    return `🧪 **Kimia Dasar:**\n\n• Konsep Mol\n• Stoikiometri\n• Persamaan Reaksi\n• Ikatan Kimia\n• Larutan dan Konsentrasi\n\nAda yang ingin ditanyakan?`;
  }
  
  // Biologi
  if (question.includes('biologi') || question.includes('sel') || question.includes('sistem') || 
      question.includes('pencernaan') || question.includes('pernapasan')) {
    return `🧬 **Biologi:**\n\n• Struktur dan Fungsi Sel\n• Sistem Pencernaan Manusia\n• Sistem Pernapasan\n• Fotosintesis\n• Genetika Dasar\n\nMateri mana yang ingin dipelajari?`;
  }
  
  // Programming
  if (question.includes('programming') || question.includes('coding') || question.includes('pemrograman') ||
      question.includes('javascript') || question.includes('react') || question.includes('python')) {
    
    if (question.includes('react')) {
      return `⚛️ **React JS:**\n\nReact adalah library JavaScript untuk membangun user interface.\n\nKonsep dasar:\n• Components\n• Props\n• State\n• Hooks (useState, useEffect)\n• React Router\n\nAda topik React yang ingin ditanyakan?`;
    }
    if (question.includes('javascript')) {
      return `💻 **JavaScript:**\n\n• ES6+ (let/const, arrow functions, template literals)\n• Array methods (map, filter, reduce)\n• Async/Await & Promises\n• DOM Manipulation\n• Event Handling\n\nMulai dari mana?`;
    }
    if (question.includes('python')) {
      return `🐍 **Python:**\n\n• Dasar sintaks\n• Data structures (list, dict, tuple)\n• Functions\n• OOP di Python\n• Library populer (NumPy, Pandas)\n\nAda yang ingin dipelajari?`;
    }
    return `Saya bisa membantu belajar pemrograman! 💻\n\nBahasa yang tersedia:\n✅ JavaScript/React\n✅ Python\n✅ HTML/CSS\n✅ Node.js\n\nMau belajar yang mana?`;
  }
  
  // Database
  if (question.includes('database') || question.includes('mongodb') || question.includes('mysql') || 
      question.includes('sql')) {
    return `🗄️ **Database:**\n\n• MongoDB (NoSQL)\n• MySQL (Relational)\n• CRUD Operations\n• Indexing\n• Aggregation\n\nAda yang ingin ditanyakan?`;
  }
  
  // Mobile Development
  if (question.includes('mobile') || question.includes('flutter') || question.includes('react native') || 
      question.includes('android') || question.includes('ios')) {
    return `📱 **Mobile Development:**\n\n• Flutter (Dart)\n• React Native (JavaScript)\n• Kotlin (Android Native)\n• Swift (iOS Native)\n\nTertarik dengan platform mana?`;
  }
  
  // Discussions / Forum
  if (question.includes('diskusi') || question.includes('forum') || question.includes('question')) {
    return `💬 **Diskusi:**\n\nAnda bisa:\n✅ Membuat pertanyaan baru\n✅ Menjawab pertanyaan orang lain\n✅ Vote like/dislike\n✅ Tag topik dengan kategori\n\nAda yang ingin ditanyakan tentang fitur diskusi?`;
  }
  
  // Courses
  if (question.includes('kursus') || question.includes('course') || question.includes('belajar')) {
    return `📖 **Kursus di Learnify:**\n\nKami memiliki berbagai kursus:\n• Matematika Dasar & Lanjutan\n• Fisika, Kimia, Biologi\n• Web Development (HTML, CSS, JS, React)\n• Mobile Development (Flutter, React Native)\n• Database (MongoDB, MySQL)\n\nKursus mana yang Anda ambil?`;
  }
  
  // About platform
  if (question.includes('learnify') || question.includes('platform') || question.includes('tentang')) {
    return `📘 **Tentang Learnify:**\n\nLearnify adalah platform pembelajaran online untuk siswa SMA Kelas 12 dan Mahasiswa.\n\nFitur:\n✅ Kursus interaktif\n✅ Diskusi Q&A\n✅ Progress tracking\n✅ Sertifikat kelulusan\n✅ AI Assistant (saya!)\n\nAda yang ingin ditanyakan?`;
  }
  
  // Help / Unknown
  if (question.includes('bantuan') || question.includes('help') || question.includes('fitur')) {
    return `🆘 **Bantuan:**\n\nSaya bisa membantu:\n📚 Materi pelajaran (Matematika, Fisika, Kimia, Biologi)\n💻 Pemrograman (React, JavaScript, Python)\n🗄️ Database (MongoDB, MySQL)\n📱 Mobile Development\n💬 Diskusi dan Forum\n📖 Kursus di Learnify\n\nSilakan tanya apa saja! 😊`;
  }
  
  // Default response
  return `Halo! Saya asisten AI Learnify. 🤖\n\nSaya bisa membantu Anda belajar:\n📌 Matematika (aljabar, kalkulus, limit, turunan)\n📌 Fisika, Kimia, Biologi\n📌 Pemrograman (React, JavaScript, Python)\n📌 Diskusi dan kursus\n\nAda yang ingin ditanyakan? 😊`;
}

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ [WS] User ${socket.user.id} - ${socket.user.name || 'Unknown'} connected to AI Chat`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   IP: ${socket.handshake.address}`);

  // Join user to personal room
  socket.join(`user:${socket.user.id}`);
  
  // Send welcome message
  socket.emit('ai:connected', {
    message: 'Terhubung ke AI Assistant',
    timestamp: new Date().toISOString()
  });

  // Handle AI chat messages
  socket.on('ai:message', async (data) => {
    try {
      const { message, context = {} } = data;
      
      if (!message || message.trim() === '') {
        socket.emit('ai:error', { 
          error: 'Pesan tidak boleh kosong' 
        });
        return;
      }

      console.log(`🤖 [WS] AI Request from user ${socket.user.id}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      console.log(`   Context: ${JSON.stringify(context)}`);

      // Emit typing indicator
      socket.emit('ai:typing', { isTyping: true });

      // Simulate processing delay (200-800ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));

      // Generate AI response
      const aiResponse = generateAIResponse(message, socket.user);
      
      // Emit response
      socket.emit('ai:response', {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        context: context
      });

      socket.emit('ai:typing', { isTyping: false });
      
      console.log(`✅ [WS] AI Response sent to user ${socket.user.id}`);

    } catch (error) {
      console.error('❌ [WS] AI Error:', error.message);
      socket.emit('ai:error', { 
        error: 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
      });
      socket.emit('ai:typing', { isTyping: false });
    }
  });

  // Handle ping/pong for connection health check
  socket.on('ping', (callback) => {
    if (typeof callback === 'function') {
      callback({
        pong: true,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ [WS] User ${socket.user.id} disconnected from AI Chat`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Socket ID: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ [WS] Socket error for user ${socket.user.id}:`, error.message);
  });
});

// ============================================
// GLOBAL MIDDLEWARE (REST API)
// ============================================

// 1. Session Middleware - untuk Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'rahasia_super_aman',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// 2. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 3. CORS Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// 4. Body Parser Middleware
app.use(express.json({ extended: true, limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 5. Request Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📨 [REST] ${timestamp} ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// API ROUTES (REST) - TANPA AI CHAT ROUTES!
// ============================================

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
console.log('   ✅ /api/auth (local) - Auth routes loaded');

// Courses Routes
app.use('/api/courses', require('./routes/courses'));
console.log('   ✅ /api/courses - Course routes loaded');

// Modules Routes
app.use('/api/modules', require('./routes/modules'));
console.log('   ✅ /api/modules - Module routes loaded');

// Materials Routes
app.use('/api/materials', require('./routes/materials'));
console.log('   ✅ /api/materials - Material routes loaded');

// Discussions Routes
app.use('/api/discussions', require('./routes/discussions'));
console.log('   ✅ /api/discussions - Discussion routes loaded');

// ============================================
// TEST/HEALTH CHECK ROUTES
// ============================================

// Root route - API Info
app.get('/', (req, res) => {
  res.json({
    name: '🚀 Learning Platform API',
    version: '2.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    googleAuth: process.env.GOOGLE_CLIENT_ID ? '✅ Enabled' : '❌ Disabled',
    websocket: '✅ Active',
    endpoints: {
      auth: {
        local: '/api/auth/login',
        register: '/api/auth/register',
        google: '/api/auth/google',
        callback: '/api/auth/google/callback',
        me: '/api/auth/me'
      },
      courses: '/api/courses',
      modules: '/api/modules',
      materials: '/api/materials',
      discussions: '/api/discussions'
    },
    websocketEvents: {
      connect: 'WebSocket connection',
      'ai:message': 'Send message to AI',
      'ai:response': 'Receive AI response',
      'ai:typing': 'Typing indicator',
      'ai:error': 'Error message',
      'ping': 'Connection health check'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    googleAuth: process.env.GOOGLE_CLIENT_ID ? 'enabled' : 'disabled',
    websocket: 'active',
    websocketConnections: io.engine.clientsCount
  });
});

// Test route - tanpa auth
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Server is working!', 
    time: new Date().toISOString() 
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  console.log(`❌ [REST] 404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Route tidak ditemukan',
    message: `Endpoint ${req.method} ${req.originalUrl} tidak tersedia`,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/',
      '/test',
      '/health',
      '/api/auth',
      '/api/auth/google',
      '/api/auth/google/callback',
      '/api/courses',
      '/api/modules',
      '/api/materials',
      '/api/discussions'
    ]
  });
});

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ [REST] Error:', err);
  console.error('Stack:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Terjadi kesalahan pada server';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    errorMessage = `${field} sudah terdaftar`;
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Token tidak valid';
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = `ID tidak valid: ${err.value}`;
  }
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    statusCode,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀  SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📌  Port:         ${PORT}`);
  console.log(`📌  URL:          http://localhost:${PORT}`);
  console.log(`📌  Database:     ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`📌  Google Auth:  ${process.env.GOOGLE_CLIENT_ID ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`📌  WebSocket:    ✅ Active`);
  
  console.log('\n📋  REGISTERED SERVICES:');
  console.log('   ┌────────────────────────────────────────────┐');
  console.log('   │  📡 WebSocket - AI Chat (Global)         │');
  console.log('   │  🔐 REST API - Auth & Courses            │');
  console.log('   │  📚 REST API - Modules & Materials       │');
  console.log('   │  💬 REST API - Discussions               │');
  console.log('   └────────────────────────────────────────────┘');
  
  console.log('\n📋  WEBSOCKET EVENTS:');
  console.log('   ┌────────────────────────────────────────────┐');
  console.log('   │  📤 ai:message  - Send message to AI      │');
  console.log('   │  📥 ai:response - Receive AI response     │');
  console.log('   │  ⌨️  ai:typing   - Typing indicator       │');
  console.log('   │  ❌ ai:error    - Error message           │');
  console.log('   │  🏓 ping        - Connection health check │');
  console.log('   └────────────────────────────────────────────┘');
  
  console.log('\n🔍  Test:        http://localhost:' + PORT + '/test');
  console.log('🔐  Google Auth: http://localhost:' + PORT + '/api/auth/google');
  console.log('📚  Courses:     http://localhost:' + PORT + '/api/courses');
  console.log('💬  Discussions: http://localhost:' + PORT + '/api/discussions');
  console.log('='.repeat(60) + '\n');
});

module.exports = { app, httpServer, io };