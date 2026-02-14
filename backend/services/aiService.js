const openai = require('../config/openai');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Discussion = require('../models/Discussion');

class AIService {
  
  /**
   * Get AI response from OpenAI
   */
  async getResponse(userMessage, context = {}) {
    try {
      console.log('🤖 Processing AI request...');
      
      const messages = this.buildMessages(userMessage, context);
      
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: messages,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      });

      const response = completion.choices[0].message.content;
      
      console.log('✅ AI response generated');
      return {
        success: true,
        message: response,
        usage: completion.usage
      };

    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return {
          success: false,
          message: 'Maaf, kuota API telah habis. Silakan hubungi administrator.',
          error: 'insufficient_quota'
        };
      }
      
      if (error.code === 'rate_limit_exceeded') {
        return {
          success: false,
          message: 'Maaf, terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
          error: 'rate_limit_exceeded'
        };
      }

      if (error.code === 'invalid_api_key') {
        return {
          success: false,
          message: 'Konfigurasi API tidak valid. Silakan hubungi administrator.',
          error: 'invalid_api_key'
        };
      }

      // Fallback response
      return {
        success: false,
        message: this.getFallbackResponse(userMessage, context),
        error: error.message
      };
    }
  }

  /**
   * Build messages array for OpenAI
   */
  buildMessages(userMessage, context) {
    const systemPrompt = this.buildSystemPrompt(context);
    const contextualPrompt = this.buildContextualPrompt(context);

    const messages = [
      { 
        role: 'system', 
        content: systemPrompt 
      }
    ];

    // Add contextual information if available
    if (contextualPrompt) {
      messages.push({
        role: 'system',
        content: contextualPrompt
      });
    }

    // Add conversation history if available
    if (context.history && context.history.length > 0) {
      context.history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Build system prompt with AI persona and guidelines
   */
  buildSystemPrompt(context) {
    return `Anda adalah "Learnify AI", asisten pembelajaran cerdas untuk platform edukasi online "Learnify". 

IDENTITAS:
- Nama: Learnify AI
- Pengembang: Learnify Education Technology
- Tujuan: Membantu siswa SMA kelas 12 dan mahasiswa tahun pertama dalam memahami materi pelajaran

KEPRIBADIAN:
- Ramah dan sabar seperti guru favorit Anda
- Antusias dalam menjelaskan konsep
- Menggunakan analogi sederhana
- Tidak menggurui
- Menggunakan emoji sesekali untuk membuat percakapan lebih hidup (👍, 😊, 📚, 💡)

BAHASA:
- Gunakan Bahasa Indonesia yang baik dan benar
- Hindari bahasa gaul yang berlebihan
- Sesuaikan tingkat bahasa dengan audiens (SMA/Mahasiswa)

GUIDELINES MENJAWAB:
1. Berikan jawaban yang terstruktur dengan poin-poin jika diperlukan
2. Sertakan contoh konkret untuk memudahkan pemahaman
3. Jika ada rumus matematika, tulis dengan format yang jelas
4. Akui jika tidak tahu jawabannya, jangan mengarang
5. Arahkan ke sumber belajar yang relevan jika perlu

MATA PELAJARAN YANG DIKUASAI:
- Matematika (Aljabar, Kalkulus, Geometri, Statistika)
- Fisika (Mekanika, Listrik Magnet, Termodinamika)
- Kimia (Stoikiometri, Kimia Organik, Kimia Fisik)
- Biologi (Sel, Genetika, Anatomi, Ekologi)
- Pemrograman (HTML, CSS, JavaScript, React, Node.js, Python)
- Database (MongoDB, MySQL)
- Mobile Development (Flutter, React Native)

JANGAN:
- Memberikan informasi medis
- Memberikan nasihat keuangan/investasi
- Membahas politik atau SARA
- Membagikan informasi pribadi pengguna

Mulai percakapan dengan semangat belajar! 📚✨`;
  }

  /**
   * Build contextual prompt based on user context
   */
  buildContextualPrompt(context) {
    const { course, module, discussion, user } = context;
    let prompt = '';

    if (course) {
      prompt += `\nKONTEKS KURSUS SAAT INI:
- Judul Kursus: ${course.title}
- Mata Pelajaran: ${course.subject}
- Tingkat: ${course.level}
- Deskripsi: ${course.description}

`;
    }

    if (module) {
      prompt += `\nKONTEKS MODUL SAAT INI:
- Judul Modul: ${module.title}
- Deskripsi: ${module.description}
- Topik: ${module.learningObjectives?.join(', ') || 'Umum'}

`;
    }

    if (discussion) {
      prompt += `\nKONTEKS DISKUSI SAAT INI:
- Judul Diskusi: ${discussion.title}
- Konten: ${discussion.content}
- Kategori: ${discussion.category}

`;
    }

    if (user) {
      prompt += `\nINFORMASI PENGGUNA:
- Nama: ${user.name}
- Role: ${user.role}
- Total Kursus: ${user.courseCount || 'Belum diketahui'}

`;
    }

    prompt += `\nINSTRUKSI KHUSUS:
1. Jawab pertanyaan berdasarkan konteks di atas jika relevan
2. Jika tidak ada konteks yang diberikan, jawab secara umum
3. Prioritaskan informasi dari konteks yang diberikan
4. Jika konteks tidak mencukupi, akui dan berikan saran`;

    return prompt;
  }

  /**
   * Get course-specific context
   */
  async getCourseContext(courseId) {
    try {
      const course = await Course.findById(courseId);
      const modules = await Module.find({ course: courseId }).limit(3);
      
      return {
        course,
        modules: modules.map(m => ({
          title: m.title,
          description: m.description,
          objectives: m.learningObjectives
        }))
      };
    } catch (error) {
      console.error('Error fetching course context:', error);
      return null;
    }
  }

  /**
   * Get discussion-specific context
   */
  async getDiscussionContext(discussionId) {
    try {
      const discussion = await Discussion.findById(discussionId)
        .populate('author', 'name');
      
      return {
        discussion,
        author: discussion.author
      };
    } catch (error) {
      console.error('Error fetching discussion context:', error);
      return null;
    }
  }

  /**
   * Fallback response when OpenAI is unavailable
   */
  getFallbackResponse(userMessage, context) {
    const question = userMessage.toLowerCase();
    
    // Simple rule-based fallback responses
    if (question.includes('halo') || question.includes('hai') || question.includes('hi')) {
      return `Halo! 👋 Selamat datang di Learnify. Ada yang bisa saya bantu?`;
    }
    
    if (question.includes('matematika') || question.includes('aljabar')) {
      return `Maaf, saat ini layanan AI sedang tidak tersedia. Namun untuk materi Matematika/Aljabar, Anda bisa mengakses modul pembelajaran di kursus "Matematika Dasar". Ada yang bisa saya bantu terkait navigasi platform? 📚`;
    }
    
    if (question.includes('programming') || question.includes('coding') || question.includes('pemrograman')) {
      return `Maaf, layanan AI sedang dalam perbaikan. Untuk belajar pemrograman, silakan cek kursus "Web Development" atau "JavaScript Modern" di dashboard Anda. 💻`;
    }
    
    return `Maaf, layanan AI Assistant sedang tidak tersedia. Silakan coba lagi nanti atau hubungi tim support kami. Terima kasih atas pengertiannya. 🙏`;
  }
}

module.exports = new AIService();